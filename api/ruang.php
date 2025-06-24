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
        $sql = "SELECT * FROM ruang";
        $result = $conn->query($sql);
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode($data);
        break;

    case 'POST':
        $input = json_decode(file_get_contents("php://input"));
        $stmt = $conn->prepare("INSERT INTO ruang (kode_ruang, nama_ruang, kapasitas) VALUES (?, ?, ?)");
        $stmt->bind_param("ssi", $input->kode_ruang, $input->nama_ruang, $input->kapasitas);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Ruang berhasil ditambahkan']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal menambahkan ruang', 'error' => $stmt->error]);
        }
        $stmt->close();
        break;

    case 'PUT':
        $input = json_decode(file_get_contents("php://input"));
        $stmt = $conn->prepare("UPDATE ruang SET nama_ruang = ?, kapasitas = ? WHERE kode_ruang = ?");
        $stmt->bind_param("sis", $input->nama_ruang, $input->kapasitas, $input->kode_ruang);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Ruang berhasil diperbarui']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal memperbarui ruang', 'error' => $stmt->error]);
        }
        $stmt->close();
        break;

    case 'DELETE':
        $kode_ruang = $_GET['kode_ruang'];
        $stmt = $conn->prepare("DELETE FROM ruang WHERE kode_ruang = ?");
        $stmt->bind_param("s", $kode_ruang);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Ruang berhasil dihapus']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal menghapus ruang', 'error' => $stmt->error]);
        }
        $stmt->close();
        break;
}

$conn->close();
?> 