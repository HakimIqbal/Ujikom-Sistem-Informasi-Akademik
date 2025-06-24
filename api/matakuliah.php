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
        $sql = "SELECT * FROM matakuliah";
        $result = $conn->query($sql);
        $matakuliah = [];
        while ($row = $result->fetch_assoc()) {
            $matakuliah[] = $row;
        }
        echo json_encode($matakuliah);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $stmt = $conn->prepare("INSERT INTO matakuliah (kode_mk, nama_mk, sks) VALUES (?, ?, ?)");
        $stmt->bind_param("ssi", $data->kode_mk, $data->nama_mk, $data->sks);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Matakuliah berhasil ditambahkan']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal menambahkan matakuliah', 'error' => $stmt->error]);
        }
        $stmt->close();
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        $stmt = $conn->prepare("UPDATE matakuliah SET nama_mk = ?, sks = ? WHERE kode_mk = ?");
        $stmt->bind_param("sis", $data->nama_mk, $data->sks, $data->kode_mk);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Matakuliah berhasil diperbarui']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal memperbarui matakuliah', 'error' => $stmt->error]);
        }
        $stmt->close();
        break;

    case 'DELETE':
        $kode_mk = $_GET['kode_mk'];
        $stmt = $conn->prepare("DELETE FROM matakuliah WHERE kode_mk = ?");
        $stmt->bind_param("s", $kode_mk);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Matakuliah berhasil dihapus']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal menghapus matakuliah', 'error' => $stmt->error]);
        }
        $stmt->close();
        break;
}

$conn->close();
?> 