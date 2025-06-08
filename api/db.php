<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

define('DB_HOST', 'bxokhwhcr2i5ypfcp4ma-mysql.services.clever-cloud.com');
define('DB_USER', 'umet7utvr4tkxiyq');
define('DB_PASS', 'WVoyd7PJ89GWIfQllrtK');
define('DB_NAME', 'bxokhwhcr2i5ypfcp4ma');

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    die(json_encode([
        "success" => false,
        "message" => "Database connection failed: " . $conn->connect_error
    ]));
}
?>