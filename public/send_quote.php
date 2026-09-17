<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data || empty($data['fullname']) || empty($data['phone'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Name and phone required"]);
    exit;
}

$fullname = htmlspecialchars($data['fullname']);
$phone = htmlspecialchars($data['phone']);
$email = !empty($data['email']) ? filter_var($data['email'], FILTER_SANITIZE_EMAIL) : 'Not provided';
$product = htmlspecialchars($data['product'] ?? 'Precast Products');
$quantity = htmlspecialchars($data['quantity'] ?? 'Not specified');
$location = htmlspecialchars($data['location'] ?? 'Kiambu / Nairobi');
$fulfillment = htmlspecialchars($data['fulfillment'] ?? 'Delivery to Site');
$message = htmlspecialchars($data['message'] ?? 'None');

$reference = "PR-" . rand(100000, 900000);
$date = date("Y-m-d H:i:s");

$to = "kierugitau0@gmail.com, info@panelproprecast.co.ke";
$subject = "[New Quote Request] " . $fullname . " - " . $product . " (Ref: " . $reference . ")";

$body = "NEW QUOTE REQUEST - PANELPRO PRECAST & LOGISTICS LTD\n";
$body .= "==================================================\n";
$body .= "Reference: " . $reference . "\n";
$body .= "Date: " . $date . "\n\n";
$body .= "CLIENT DETAILS:\n";
$body .= "- Name / Company: " . $fullname . "\n";
$body .= "- Phone: " . $phone . "\n";
$body .= "- Email: " . $email . "\n\n";
$body .= "PROJECT DETAILS:\n";
$body .= "- Product: " . $product . "\n";
$body .= "- Quantity: " . $quantity . "\n";
$body .= "- Location: " . $location . "\n";
$body .= "- Fulfillment: " . $fulfillment . "\n\n";
$body .= "NOTES:\n" . $message . "\n";
$body .= "==================================================\n";
$body .= "Kenyatta Road Factory Yard, Juja, Kiambu County\n";

$headers = "From: sales@panelproprecast.co.ke\r\n";
if (!empty($data['email'])) {
    $headers .= "Reply-To: " . $data['email'] . "\r\n";
}
$headers .= "X-Mailer: PHP/" . phpversion();

@mail($to, $subject, $body, $headers);

echo json_encode([
    "success" => true,
    "reference" => $reference,
    "message" => "Quote request sent to Sales, PanelPro Precast and Logistics Ltd successfully."
]);
