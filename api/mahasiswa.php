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
        $sql = "SELECT * FROM mahasiswa";
        $result = $conn->query($sql);
        $mahasiswa = [];
        while ($row = $result->fetch_assoc()) {
            $mahasiswa[] = $row;
        }
        echo json_encode($mahasiswa);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        $conn->begin_transaction();
        try {
            $stmt_user = $conn->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, 'mahasiswa')");
            $password = 'password'; 
            $stmt_user->bind_param("ss", $data->nim, $password);
            $stmt_user->execute();
            $stmt_user->close();

            $stmt_mhs = $conn->prepare("INSERT INTO mahasiswa (nim, nama, jurusan, angkatan) VALUES (?, ?, ?, ?)");
            $stmt_mhs->bind_param("sssi", $data->nim, $data->nama, $data->jurusan, $data->angkatan);
            $stmt_mhs->execute();
            $stmt_mhs->close();

            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'Mahasiswa berhasil ditambahkan']);
        } catch (mysqli_sql_exception $exception) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Gagal menambahkan mahasiswa', 'error' => $exception->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        $nim = $data->nim;
        $nama = $data->nama;
        $jurusan = $data->jurusan;
        $angkatan = $data->angkatan;

        $stmt = $conn->prepare("UPDATE mahasiswa SET nama = ?, jurusan = ?, angkatan = ? WHERE nim = ?");
        $stmt->bind_param("ssis", $nama, $jurusan, $angkatan, $nim);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Mahasiswa berhasil diperbarui']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal memperbarui mahasiswa']);
        }
        $stmt->close();
        break;

    case 'DELETE':
        $nim = $_GET['nim'];

        $stmt = $conn->prepare("DELETE FROM users WHERE username = ?");
        $stmt->bind_param("s", $nim);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Mahasiswa berhasil dihapus']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal menghapus mahasiswa']);
        }
        $stmt->close();
        break;
}

$conn->close();
?> 