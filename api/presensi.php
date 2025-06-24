<?php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit(0);
}
header('Access-Control-Allow-Origin: *');

switch ($method) {
    case 'GET':
        $nim = $_GET['nim'] ?? null;
        $id_jadwal = $_GET['id_jadwal'] ?? null;

        if ($nim) {
            $sql = "
                SELECT p.tanggal, p.status, m.nama_mk 
                FROM presensi p
                JOIN jadwal_kuliah j ON p.id_jadwal = j.id_jadwal
                JOIN matakuliah m ON j.kode_mk = m.kode_mk
                WHERE p.nim = ? ORDER BY p.tanggal DESC
            ";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $nim);
            $stmt->execute();
            $result = $stmt->get_result();
        } elseif ($id_jadwal) {
            $sql = "
                SELECT m.nim, m.nama 
                FROM krs k
                JOIN mahasiswa m ON k.nim = m.nim
                WHERE k.id_jadwal = ? ORDER BY m.nama
            ";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id_jadwal);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $tanggal = $_GET['tanggal'] ?? null;
            $kode_mk_filter = $_GET['kode_mk'] ?? null;

            $sql = "
                SELECT p.id_presensi, p.tanggal, p.status, mhs.nim, mhs.nama as nama_mahasiswa, mk.nama_mk 
                FROM presensi p
                JOIN mahasiswa mhs ON p.nim = mhs.nim
                JOIN jadwal_kuliah j ON p.id_jadwal = j.id_jadwal
                JOIN matakuliah mk ON j.kode_mk = mk.kode_mk
            ";
            $params = [];
            $types = '';
            if ($tanggal || $kode_mk_filter) {
                $sql .= " WHERE ";
                if ($tanggal) {
                    $sql .= "p.tanggal = ?";
                    $params[] = $tanggal;
                    $types .= 's';
                }
                if ($kode_mk_filter) {
                    $sql .= ($tanggal ? " AND " : "") . "j.kode_mk = ?";
                    $params[] = $kode_mk_filter;
                    $types .= 's';
                }
            }
             $sql .= " ORDER BY p.tanggal DESC";
            
            $stmt = $conn->prepare($sql);
            if (!empty($params)) {
                 $stmt->bind_param($types, ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
        }
        
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode($data);
        break;

    case 'POST':
        $input = json_decode(file_get_contents("php://input"));
        
        $id_jadwal = $input->id_jadwal;
        $tanggal = $input->tanggal;
        $presensi_data = $input->presensi; 

        $conn->begin_transaction();
        try {
            $stmt_delete = $conn->prepare("DELETE FROM presensi WHERE id_jadwal = ? AND tanggal = ?");
            $stmt_delete->bind_param("is", $id_jadwal, $tanggal);
            $stmt_delete->execute();
            $stmt_delete->close();
            
            $stmt_insert = $conn->prepare("INSERT INTO presensi (id_jadwal, nim, tanggal, status) VALUES (?, ?, ?, ?)");
            foreach ($presensi_data as $p) {
                $stmt_insert->bind_param("isss", $id_jadwal, $p->nim, $tanggal, $p->status);
                $stmt_insert->execute();
            }
            $stmt_insert->close();

            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'Presensi berhasil disimpan']);
        } catch (mysqli_sql_exception $exception) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Gagal menyimpan presensi', 'error' => $exception->getMessage()]);
        }
        break;
}

$conn->close();
?> 