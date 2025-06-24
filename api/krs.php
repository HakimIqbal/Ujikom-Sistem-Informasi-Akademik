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
        $nim = $_GET['nim'] ?? null;
        if ($nim) {
            $sql = "
                SELECT k.id_krs, k.semester, j.id_jadwal, m.kode_mk, m.nama_mk, m.sks, d.nama as nama_dosen
                FROM krs k
                JOIN jadwal_kuliah j ON k.id_jadwal = j.id_jadwal
                JOIN matakuliah m ON j.kode_mk = m.kode_mk
                JOIN dosen d ON j.nip_dosen = d.nip
                WHERE k.nim = ?
            ";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $nim);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $sql = "
                SELECT k.id_krs, mhs.nim, mhs.nama as nama_mahasiswa, j.id_jadwal, mk.kode_mk, mk.nama_mk
                FROM krs k
                JOIN mahasiswa mhs ON k.nim = mhs.nim
                JOIN jadwal_kuliah j ON k.id_jadwal = j.id_jadwal
                JOIN matakuliah mk ON j.kode_mk = mk.kode_mk
            ";
             $result = $conn->query($sql);
        }
        
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode($data);
        break;

    case 'POST':
        $input = json_decode(file_get_contents("php://input"));
        $stmt = $conn->prepare("INSERT INTO krs (nim, id_jadwal, semester) VALUES (?, ?, ?)");
        $stmt->bind_param("sii", $input->nim, $input->id_jadwal, $input->semester);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'KRS berhasil ditambahkan']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal menambahkan KRS', 'error' => $stmt->error]);
        }
        $stmt->close();
        break;

    case 'DELETE':
        $id_krs = $_GET['id_krs'];
        $stmt = $conn->prepare("DELETE FROM krs WHERE id_krs = ?");
        $stmt->bind_param("i", $id_krs);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'KRS berhasil dihapus']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal menghapus KRS', 'error' => $stmt->error]);
        }
        $stmt->close();
        break;
}

$conn->close();
?> 