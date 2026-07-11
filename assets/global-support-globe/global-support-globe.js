import * as THREE from "./vendor/three.module.min.js";
import { OrbitControls } from "./vendor/OrbitControls.js";

const GEOJSON_URL = new URL("./countries-110m.geojson", import.meta.url);

// Inferred from the flattened Cantel "Global Coverage" slide supplied by Duncan.
// Please refine against the original editable PowerPoint if exact contractual coverage matters.
const FULLY_SUPPORTED_COUNTRIES = [
  "Argentina",
  "Australia",
  "Austria",
  "Belgium",
  "Bolivia",
  "Brazil",
  "Bulgaria",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Croatia",
  "Czechia",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Ireland",
  "Italy",
  "Japan",
  "Kenya",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malaysia",
  "Mexico",
  "Netherlands",
  "New Zealand",
  "Norway",
  "Poland",
  "Portugal",
  "Romania",
  "Serbia",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "Taiwan",
  "Thailand",
  "Turkey",
  "Ukraine",
  "United Kingdom",
  "United States of America",
  "Vietnam"
];

const PARTIALLY_SUPPORTED_COUNTRIES = [
  "Algeria",
  "Armenia",
  "Azerbaijan",
  "Costa Rica",
  "Ecuador",
  "Egypt",
  "Ethiopia",
  "Georgia",
  "Iraq",
  "Israel",
  "Jordan",
  "Kazakhstan",
  "Kuwait",
  "Morocco",
  "Nigeria",
  "Oman",
  "Panama",
  "Paraguay",
  "Peru",
  "Qatar",
  "Russia",
  "Saudi Arabia",
  "Sri Lanka",
  "Tanzania",
  "United Arab Emirates",
  "Uruguay",
  "Venezuela",
  "Zambia"
];

const COUNTRY_ALIASES = new Map([
  ["United States", "United States of America"],
  ["USA", "United States of America"],
  ["US", "United States of America"],
  ["UK", "United Kingdom"],
  ["Great Britain", "United Kingdom"],
  ["Czech Republic", "Czechia"],
  ["Korea, Republic of", "South Korea"],
  ["Republic of Korea", "South Korea"],
  ["Russian Federation", "Russia"],
  ["Türkiye", "Turkey"],
  ["Viet Nam", "Vietnam"],
  ["Iran, Islamic Republic of", "Iran"],
  ["Syrian Arab Republic", "Syria"],
  ["Lao People's Democratic Republic", "Laos"],
  ["Bolivia, Plurinational State of", "Bolivia"],
  ["Venezuela, Bolivarian Republic of", "Venezuela"],
  ["Moldova, Republic of", "Moldova"],
  ["Taiwan, Province of China", "Taiwan"]
]);

const STATUS = {
  full: {
    label: "Fully supported",
    color: new THREE.Color("#28566b"),
    emissive: new THREE.Color("#0d2834"),
    height: 0.09
  },
  partial: {
    label: "Partially supported",
    color: new THREE.Color("#83cde3"),
    emissive: new THREE.Color("#1b6578"),
    height: 0.075
  },
  none: {
    label: "Not supported",
    color: new THREE.Color("#4b5563"),
    emissive: new THREE.Color("#151a22"),
    height: 0.055
  }
};

const fullSet = new Set(FULLY_SUPPORTED_COUNTRIES.map(normaliseCountryName));
const partialSet = new Set(PARTIALLY_SUPPORTED_COUNTRIES.map(normaliseCountryName));

const root = document.getElementById("global-support-globe");
if (root) mountGlobalSupportGlobe(root);

async function mountGlobalSupportGlobe(container) {
  const loading = document.createElement("div");
  loading.className = "support-globe-loading";
  loading.textContent = "Building global support model...";
  container.appendChild(loading);

  const tooltip = document.createElement("div");
  tooltip.className = "support-globe-tooltip";
  container.appendChild(tooltip);

  try {
    const features = await fetchCountryFeatures();
    loading.remove();

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf8fbfc, 4.2, 8);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.25, 4.3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 2.9;
    controls.maxDistance = 5.7;
    controls.rotateSpeed = 0.45;

    const globe = new THREE.Group();
    globe.rotation.y = -0.55;
    scene.add(globe);

    addSphere(globe);
    addLighting(scene);

    const pinMeshes = buildPins(features, globe);
    const pickables = Object.values(pinMeshes);

    const pointer = new THREE.Vector2(10, 10);
    const raycaster = new THREE.Raycaster();
    let pointerInside = false;
    let desiredSpin = 0.0022;
    let actualSpin = desiredSpin;

    container.addEventListener("pointerenter", () => {
      pointerInside = true;
      desiredSpin = 0.016;
    });

    container.addEventListener("pointerleave", () => {
      pointerInside = false;
      desiredSpin = 0.0022;
      pointer.set(10, 10);
      tooltip.classList.remove("is-visible");
    });

    container.addEventListener("pointermove", (event) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      tooltip.style.left = `${event.clientX - rect.left}px`;
      tooltip.style.top = `${event.clientY - rect.top}px`;
    });

    window.addEventListener("resize", () => resize(container, camera, renderer));
    resize(container, camera, renderer);

    renderer.setAnimationLoop(() => {
      actualSpin += (desiredSpin - actualSpin) * 0.04;
      globe.rotation.y += actualSpin;
      controls.update();
      updateTooltip(raycaster, pointer, camera, pickables, tooltip, pointerInside);
      renderer.render(scene, camera);
    });
  } catch (error) {
    loading.className = "support-globe-error";
    loading.textContent = "The global support model could not load. Check the country data URL or network access.";
    console.error(error);
  }
}

async function fetchCountryFeatures() {
  const response = await fetch(GEOJSON_URL);
  if (!response.ok) throw new Error(`Could not fetch country data: ${response.status}`);
  const geojson = await response.json();
  return geojson.features.filter((feature) => feature.geometry);
}

function addSphere(group) {
  const ocean = new THREE.Mesh(
    new THREE.SphereGeometry(1, 96, 96),
    new THREE.MeshStandardMaterial({
      color: "#f5fafb",
      roughness: 0.72,
      metalness: 0.02,
      transparent: true,
      opacity: 0.68
    })
  );
  group.add(ocean);

  const rim = new THREE.Mesh(
    new THREE.SphereGeometry(1.006, 96, 96),
    new THREE.MeshBasicMaterial({
      color: "#dceff4",
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide
    })
  );
  group.add(rim);
}

function addLighting(scene) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8ca3ad, 2.2));

  const key = new THREE.DirectionalLight(0xffffff, 2.8);
  key.position.set(3, 3, 4);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x83cde3, 1.2);
  fill.position.set(-4, 1, 2);
  scene.add(fill);
}

function buildPins(features, group) {
  const pinsByStatus = { full: [], partial: [], none: [] };

  for (const feature of features) {
    const countryName = getCountryName(feature);
    const status = getCountryStatus(countryName);
    const samples = sampleFeature(feature, status === "none" ? 3.1 : 2.2);

    for (const sample of samples) {
      pinsByStatus[status].push({
        country: countryName,
        status,
        position: latLonToVector3(sample.lat, sample.lon, 1 + STATUS[status].height / 2),
        normal: latLonToVector3(sample.lat, sample.lon, 1).normalize()
      });
    }
  }

  const meshes = {};
  for (const status of Object.keys(pinsByStatus)) {
    meshes[status] = createPinMesh(pinsByStatus[status], STATUS[status]);
    group.add(meshes[status]);
  }
  return meshes;
}

function createPinMesh(pins, statusStyle) {
  const geometry = new THREE.CylinderGeometry(0.0065, 0.008, statusStyle.height, 7, 1);
  const material = new THREE.MeshStandardMaterial({
    color: statusStyle.color,
    emissive: statusStyle.emissive,
    emissiveIntensity: 0.09,
    roughness: 0.48,
    metalness: 0.08
  });
  const mesh = new THREE.InstancedMesh(geometry, material, pins.length);
  mesh.userData.pins = pins;
  mesh.userData.statusLabel = statusStyle.label;

  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3(1, 1, 1);
  const up = new THREE.Vector3(0, 1, 0);

  pins.forEach((pin, index) => {
    quaternion.setFromUnitVectors(up, pin.normal);
    matrix.compose(pin.position, quaternion, scale);
    mesh.setMatrixAt(index, matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

function updateTooltip(raycaster, pointer, camera, pickables, tooltip, pointerInside) {
  if (!pointerInside) return;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pickables, false);
  const hit = hits.find((item) => Number.isInteger(item.instanceId));

  if (!hit) {
    tooltip.classList.remove("is-visible");
    return;
  }

  const pin = hit.object.userData.pins[hit.instanceId];
  tooltip.innerHTML = `<strong>${escapeHtml(pin.country)}</strong><span>${STATUS[pin.status].label}</span>`;
  tooltip.classList.add("is-visible");
}

function resize(container, camera, renderer) {
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function sampleFeature(feature, stepDegrees) {
  const polygons = flattenPolygons(feature.geometry);
  const points = [];

  for (const polygon of polygons) {
    const box = polygonBounds(polygon);
    const step = Math.max(1.2, Math.min(stepDegrees, Math.max(box.maxLon - box.minLon, box.maxLat - box.minLat) / 8));
    let polygonPointCount = 0;

    for (let lat = box.minLat; lat <= box.maxLat; lat += step) {
      for (let lon = box.minLon; lon <= box.maxLon; lon += step) {
        if (pointInPolygon([lon, lat], polygon)) {
          points.push({ lat, lon });
          polygonPointCount++;
        }
      }
    }

    if (polygonPointCount === 0) {
      const centroid = polygonCentroid(polygon[0]);
      points.push({ lat: centroid[1], lon: centroid[0] });
    }
  }

  return points;
}

function flattenPolygons(geometry) {
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  return [];
}

function polygonBounds(polygon) {
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  for (const ring of polygon) {
    for (const coord of ring) {
      const lon = coord[0];
      const lat = coord[1];
      minLon = Math.min(minLon, lon);
      maxLon = Math.max(maxLon, lon);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }
  }

  return { minLon, maxLon, minLat, maxLat };
}

function pointInPolygon(point, polygon) {
  if (!pointInRing(point, polygon[0])) return false;
  for (let i = 1; i < polygon.length; i++) {
    if (pointInRing(point, polygon[i])) return false;
  }
  return true;
}

function pointInRing(point, ring) {
  const x = point[0];
  const y = point[1];
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }

  return inside;
}

function polygonCentroid(ring) {
  let lon = 0;
  let lat = 0;
  for (const coord of ring) {
    lon += coord[0];
    lat += coord[1];
  }
  return [lon / ring.length, lat / ring.length];
}

function latLonToVector3(lat, lon, radius) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function getCountryName(feature) {
  const props = feature.properties || {};
  return props.ADMIN || props.name || props.NAME || props.NAME_EN || props.SOVEREIGNT || "Unknown country";
}

function getCountryStatus(countryName) {
  const name = normaliseCountryName(countryName);
  if (fullSet.has(name)) return "full";
  if (partialSet.has(name)) return "partial";
  return "none";
}

function normaliseCountryName(name) {
  const trimmed = String(name || "").trim();
  return COUNTRY_ALIASES.get(trimmed) || trimmed;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

