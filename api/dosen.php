<?php
require 'db.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    if (isset($_GET['action']) && $_GET['action'] == 'get_mahasiswa' && isset($_GET['nip'])) {
        $nip_dosen = $_GET['nip'];
        $stmt = $conn->prepare("
            SELECT DISTINCT m.nim, m.nama, m.jurusan, m.angkatan 
            FROM mahasiswa m
            JOIN krs k ON m.nim = k.nim
            JOIN jadwal_kuliah j ON k.id_jadwal = j.id_jadwal
            WHERE j.nip_dosen = ?
            ORDER BY m.nim
        ");
        $stmt->bind_param("s", $nip_dosen);
        $stmt->execute();
        $result = $stmt->get_result();
        $mahasiswa = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($mahasiswa);
        $stmt->close();
    } else if (isset($_GET['nip'])) {
        $stmt = $conn->prepare("SELECT * FROM dosen WHERE nip = ?");
        $stmt->bind_param("s", $_GET['nip']);
        $stmt->execute();
        $result = $stmt->get_result();
        echo json_encode($result->fetch_assoc());
        $stmt->close();
    } else {
        $sql = "SELECT * FROM dosen";
        $result = $conn->query($sql);
        $dosen = [];
        while ($row = $result->fetch_assoc()) {
            $dosen[] = $row;
        }
        echo json_encode($dosen);
    }
} elseif ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    $conn->begin_transaction();
    try {
        $stmt_user = $conn->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, 'dosen')");
        $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
        $stmt_user->bind_param("ss", $data->nip, $hashed_password);
        $stmt_user->execute();
        $stmt_user->close();

        $stmt_dosen = $conn->prepare("INSERT INTO dosen (nip, nama, alamat) VALUES (?, ?, ?)");
        $stmt_dosen->bind_param("sss", $data->nip, $data->nama, $data->alamat);
        $stmt_dosen->execute();
        $stmt_dosen->close();

        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Dosen berhasil ditambahkan']);
    } catch (mysqli_sql_exception $exception) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Gagal menambahkan dosen: ' . $exception->getMessage()]);
        http_response_code(500);
    }
} elseif ($method == 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    
    $stmt = $conn->prepare("UPDATE dosen SET nama = ?, alamat = ? WHERE nip = ?");
    $stmt->bind_param("sss", $data->nama, $data->alamat, $data->nip);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Dosen berhasil diperbarui']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Gagal memperbarui dosen']);
    }
    $stmt->close();
} elseif ($method == 'DELETE') {
    $nip = $_GET['nip'];

    $conn->begin_transaction();
    try {
        $stmt_dosen = $conn->prepare("DELETE FROM dosen WHERE nip = ?");
        $stmt_dosen->bind_param("s", $nip);
        $stmt_dosen->execute();
        $stmt_dosen->close();
        
        $stmt_user = $conn->prepare("DELETE FROM users WHERE username = ?");
        $stmt_user->bind_param("s", $nip);
        $stmt_user->execute();
        $stmt_user->close();

        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Dosen berhasil dihapus']);
    } catch (mysqli_sql_exception $exception) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Gagal menghapus dosen: ' . $exception->getMessage()]);
        http_response_code(500);
    }
}

$conn->close();
?> 