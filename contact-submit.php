<?php
declare(strict_types=1);

const CONTACT_RECIPIENT = 'info@myrmekes.co.uk';
const CONTACT_FROM = 'info@myrmekes.co.uk';

function redirect_to_form(string $query): never
{
    header('Location: contact.html?' . $query, true, 303);
    exit;
}

function field(string $name, int $maxLength): string
{
    $value = trim((string) ($_POST[$name] ?? ''));
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '';
    return function_exists('mb_substr')
        ? mb_substr($value, 0, $maxLength, 'UTF-8')
        : substr($value, 0, $maxLength);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    header('Content-Type: text/plain; charset=UTF-8');
    echo "This endpoint accepts contact-form submissions only.\n";
    exit;
}

// A real visitor never sees or fills this field.
if (field('website', 200) !== '') {
    redirect_to_form('sent=1');
}

$started = filter_input(INPUT_POST, 'form_started', FILTER_VALIDATE_INT);
if ($started !== false && $started !== null) {
    $elapsedMs = (int) round(microtime(true) * 1000) - $started;
    if ($elapsedMs < 2000 || $elapsedMs > 86400000) {
        redirect_to_form('error=validation');
    }
}

$name = field('name', 120);
$company = field('company', 160);
$email = field('email', 254);
$phone = field('phone', 40);
$need = field('need', 100);
$details = field('details', 3000);
$preferredTime = field('time', 120);
$context = field('context', 160);

$allowedNeeds = [
    'Hardware going end-of-service-life',
    'Break/fix or SLA cover',
    'Engineers onsite',
    'Hardware sourced or refreshed',
    'Laptop / tablet repair cover',
    'Something else',
];

if (
    $name === '' ||
    $details === '' ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    !in_array($need, $allowedNeeds, true)
) {
    redirect_to_form('error=validation');
}

// Best-effort rate limiting. Only a one-way hash and timestamp are retained.
$remoteAddress = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$rateFile = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR)
    . DIRECTORY_SEPARATOR
    . 'myrmekes-contact-'
    . hash('sha256', $remoteAddress);
$lastSubmission = is_file($rateFile) ? (int) filemtime($rateFile) : 0;
if ($lastSubmission > 0 && (time() - $lastSubmission) < 30) {
    redirect_to_form('error=rate');
}
@touch($rateFile);

$subject = 'Website enquiry: ' . $need;
$lines = [
    'New enquiry from the Myrmekes website',
    '',
    'Name: ' . $name,
    'Company: ' . ($company !== '' ? $company : '-'),
    'Email: ' . $email,
    'Phone: ' . ($phone !== '' ? $phone : '-'),
    'Help needed with: ' . $need,
    'Page context: ' . ($context !== '' ? $context : '-'),
    '',
    "What's happening:",
    $details,
    '',
    'Preferred call time: ' . ($preferredTime !== '' ? $preferredTime : 'Any'),
    '',
    'Submitted: ' . gmdate('Y-m-d H:i:s') . ' UTC',
];

$headers = [
    'From: Myrmekes Website <' . CONTACT_FROM . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];

$sent = mail(
    CONTACT_RECIPIENT,
    '=?UTF-8?B?' . base64_encode($subject) . '?=',
    implode("\r\n", $lines),
    implode("\r\n", $headers)
);

if (!$sent) {
    redirect_to_form('error=send');
}

redirect_to_form('sent=1');
