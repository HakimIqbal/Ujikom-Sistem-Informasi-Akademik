<?php
require 'db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit(0);
}

if ($method == 'GET') {
    $base_sql = "
        SELECT 
            j.id_jadwal, j.hari, j.jam_mulai, j.jam_selesai, 
            m.kode_mk, m.nama_mk, m.sks,
            d.nip AS nip_dosen, d.nama AS nama_dosen, 
            r.kode_ruang, r.nama_ruang, 
            g.id_golongan, g.nama_golongan
        FROM jadwal_kuliah j
        JOIN matakuliah m ON j.kode_mk = m.kode_mk
        JOIN dosen d ON j.nip_dosen = d.nip
        JOIN ruang r ON j.kode_ruang = r.kode_ruang
        JOIN golongan g ON j.id_golongan = g.id_golongan
    ";

    if (isset($_GET['nim'])) {
        $nim = $_GET['nim'];
        $sql = $base_sql . " JOIN krs k ON j.id_jadwal = k.id_jadwal WHERE k.nim = ? ORDER BY j.hari, j.jam_mulai";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $nim);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
    } else if (isset($_GET['nip'])) {
        $nip = $_GET['nip'];
        $sql = $base_sql . " WHERE j.nip_dosen = ? ORDER BY j.hari, j.jam_mulai";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $nip);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
    } else {
        $sql = $base_sql . " ORDER BY j.hari, j.jam_mulai";
        $result = $conn->query($sql);
        $data = $result->fetch_all(MYSQLI_ASSOC);
    }
    echo json_encode($data);

} elseif ($method == 'POST') {
    $input = json_decode(file_get_contents("php://input"));
    $stmt = $conn->prepare("INSERT INTO jadwal_kuliah (kode_mk, nip_dosen, kode_ruang, id_golongan, hari, jam_mulai, jam_selesai) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssisss", $input->kode_mk, $input->nip_dosen, $input->kode_ruang, $input->id_golongan, $input->hari, $input->jam_mulai, $input->jam_selesai);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Jadwal berhasil ditambahkan']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Gagal menambahkan jadwal', 'error' => $stmt->error]);
    }
    $stmt->close();

} elseif ($method == 'PUT') {
    $input = json_decode(file_get_contents("php://input"));
    $stmt = $conn->prepare("UPDATE jadwal_kuliah SET kode_mk = ?, nip_dosen = ?, kode_ruang = ?, id_golongan = ?, hari = ?, jam_mulai = ?, jam_selesai = ? WHERE id_jadwal = ?");
    $stmt->bind_param("sssisssi", $input->kode_mk, $input->nip_dosen, $input->kode_ruang, $input->id_golongan, $input->hari, $input->jam_mulai, $input->jam_selesai, $input->id_jadwal);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Jadwal berhasil diperbarui']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Gagal memperbarui jadwal', 'error' => $stmt->error]);
    }
    $stmt->close();

} elseif ($method == 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id_jadwal = $input['id_jadwal'];
    $stmt = $conn->prepare("DELETE FROM jadwal_kuliah WHERE id_jadwal = ?");
    $stmt->bind_param("i", $id_jadwal);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Jadwal berhasil dihapus']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Gagal menghapus jadwal', 'error' => $stmt->error]);
    }
    $stmt->close();
}

$conn->close();
?> 