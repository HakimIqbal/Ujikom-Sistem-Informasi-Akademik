<?php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit(0);
}
header('Access-Control-Allow-Origin: *');

switch ($method) {
    case 'GET':
        $sql = "SELECT * FROM golongan";
        $result = $conn->query($sql);
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode($data);
        break;

    case 'POST':
        $input = json_decode(file_get_contents("php://input"));
        $stmt = $conn->prepare("INSERT INTO golongan (nama_golongan) VALUES (?)");
        $stmt->bind_param("s", $input->nama_golongan);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Golongan berhasil ditambahkan']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal menambahkan golongan', 'error' => $stmt->error]);
        }
        $stmt->close();
        break;

    case 'PUT':
        $input = json_decode(file_get_contents("php://input"));
        $stmt = $conn->prepare("UPDATE golongan SET nama_golongan = ? WHERE id_golongan = ?");
        $stmt->bind_param("si", $input->nama_golongan, $input->id_golongan);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Golongan berhasil diperbarui']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal memperbarui golongan', 'error' => $stmt->error]);
        }
        $stmt->close();
        break;

    case 'DELETE':
        $id_golongan = $_GET['id_golongan'];
        $stmt = $conn->prepare("DELETE FROM golongan WHERE id_golongan = ?");
        $stmt->bind_param("i", $id_golongan);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Golongan berhasil dihapus']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal menghapus golongan', 'error' => $stmt->error]);
        }
        $stmt->close();
        break;
}

$conn->close();
?> 