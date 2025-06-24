<?php
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    $username = $data->username;
    $password = $data->password;

    $stmt = $conn->prepare("SELECT role FROM users WHERE username = ? AND password = ?");
    $stmt->bind_param("ss", $username, $password);

    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        echo json_encode([
            "success" => true,
            "role" => $user['role'],
            "username" => $username
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Username atau password salah."
        ]);
    }

    $stmt->close();
    $conn->close();
}
?> 