<?php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit(0);
}
header('Access-Control-Allow-Origin: *');

switch ($method) {
    case 'GET':
        $sql = "
            SELECT p.id_pengampu, p.kode_mk, m.nama_mk, p.nip_dosen, d.nama AS nama_dosen
            FROM pengampu p
            JOIN matakuliah m ON p.kode_mk = m.kode_mk
            JOIN dosen d ON p.nip_dosen = d.nip
        ";
        $result = $conn->query($sql);
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode($data);
        break;

    case 'POST':
        $input = json_decode(file_get_contents("php://input"));
        $stmt = $conn->prepare("INSERT INTO pengampu (kode_mk, nip_dosen) VALUES (?, ?)");
        $stmt->bind_param("ss", $input->kode_mk, $input->nip_dosen);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Pengampu berhasil ditambahkan']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal menambahkan pengampu. Matakuliah ini mungkin sudah memiliki pengampu.', 'error' => $stmt->error]);
        }
        $stmt->close();
        break;

    case 'DELETE':
        $id_pengampu = $_GET['id_pengampu'];
        $stmt = $conn->prepare("DELETE FROM pengampu WHERE id_pengampu = ?");
        $stmt->bind_param("i", $id_pengampu);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Pengampu berhasil dihapus']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal menghapus pengampu', 'error' => $stmt->error]);
        }
        $stmt->close();
        break;
}

$conn->close();
?> 