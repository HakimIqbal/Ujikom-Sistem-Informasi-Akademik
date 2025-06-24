-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 25, 2023 at 05:00 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `siakad_db`
--
CREATE DATABASE IF NOT EXISTS `siakad_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `siakad_db`;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','mahasiswa','dosen') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`username`, `password`, `role`) VALUES
('admin', 'admin', 'admin'),
('11220001', 'password', 'mahasiswa'),
('11220002', 'password', 'mahasiswa'),
('11220003', 'password', 'mahasiswa'),
('11220004', 'password', 'mahasiswa'),
('11220005', 'password', 'mahasiswa'),
('11220006', 'password', 'mahasiswa'),
('11220007', 'password', 'mahasiswa'),
('11220008', 'password', 'mahasiswa'),
('11220009', 'password', 'mahasiswa'),
('11220010', 'password', 'mahasiswa'),
('D001', 'password', 'dosen'),
('D002', 'password', 'dosen'),
('D003', 'password', 'dosen'),
('D004', 'password', 'dosen'),
('D005', 'password', 'dosen'),
('D006', 'password', 'dosen'),
('D007', 'password', 'dosen'),
('D008', 'password', 'dosen'),
('D009', 'password', 'dosen'),
('D010', 'password', 'dosen');

-- --------------------------------------------------------

--
-- Table structure for table `dosen`
--

CREATE TABLE `dosen` (
  `nip` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `alamat` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dosen`
--

INSERT INTO `dosen` (`nip`, `nama`, `alamat`) VALUES
('D001', 'Dr. Budi Santoso', 'Jl. Merdeka 1, Jakarta'),
('D002', 'Dr. Siti Aminah', 'Jl. Sudirman 2, Bandung'),
('D003', 'Prof. Dr. Joko Susilo', 'Jl. Gajah Mada 3, Surabaya'),
('D004', 'Dr. Retno Wulandari', 'Jl. Pahlawan 4, Semarang'),
('D005', 'Dr. Agus Purnomo', 'Jl. Diponegoro 5, Yogyakarta'),
('D006', 'Dr. Dewi Lestari', 'Jl. Asia Afrika 6, Bandung'),
('D007', 'Prof. Dr. Hendra Wijaya', 'Jl. Thamrin 7, Jakarta'),
('D008', 'Dr. Indah Permatasari', 'Jl. Kartini 8, Surabaya'),
('D009', 'Dr. Rian Hidayat', 'Jl. Gatot Subroto 9, Jakarta'),
('D010', 'Dr. Fitriani', 'Jl. Ahmad Yani 10, Semarang');

-- --------------------------------------------------------

--
-- Table structure for table `mahasiswa`
--

CREATE TABLE `mahasiswa` (
  `nim` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `jurusan` varchar(50) NOT NULL,
  `angkatan` int(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mahasiswa`
--

INSERT INTO `mahasiswa` (`nim`, `nama`, `jurusan`, `angkatan`) VALUES
('11220001', 'Adi Saputra', 'Teknik Informatika', 2022),
('11220002', 'Bunga Citra', 'Sistem Informasi', 2022),
('11220003', 'Cahyo Wijoyo', 'Teknik Informatika', 2022),
('11220004', 'Dewi Anggraini', 'Manajemen Informatika', 2022),
('11220005', 'Eko Prasetyo', 'Teknik Komputer', 2022),
('11220006', 'Fitriana', 'Teknik Informatika', 2023),
('11220007', 'Gilang Ramadhan', 'Sistem Informasi', 2023),
('11220008', 'Hana Yulita', 'Manajemen Informatika', 2023),
('11220009', 'Indra Kusuma', 'Teknik Komputer', 2023),
('11220010', 'Joko Widodo', 'Teknik Informatika', 2023);

-- --------------------------------------------------------

--
-- Table structure for table `matakuliah`
--

CREATE TABLE `matakuliah` (
  `kode_mk` varchar(10) NOT NULL,
  `nama_mk` varchar(100) NOT NULL,
  `sks` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `matakuliah`
--

INSERT INTO `matakuliah` (`kode_mk`, `nama_mk`, `sks`) VALUES
('IF001', 'Dasar Pemrograman', 3),
('IF002', 'Struktur Data', 3),
('IF003', 'Basis Data', 3),
('SI001', 'Analisis Sistem', 3),
('MI001', 'Desain Web', 2),
('TK001', 'Arsitektur Komputer', 3),
('UM001', 'Bahasa Inggris', 2),
('UM002', 'Pendidikan Kewarganegaraan', 2),
('IF004', 'Jaringan Komputer', 3),
('SI002', 'Manajemen Proyek SI', 3);

-- --------------------------------------------------------

--
-- Table structure for table `ruang`
--

CREATE TABLE `ruang` (
  `kode_ruang` varchar(10) NOT NULL,
  `nama_ruang` varchar(50) NOT NULL,
  `kapasitas` int(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ruang`
--

INSERT INTO `ruang` (`kode_ruang`, `nama_ruang`, `kapasitas`) VALUES
('R001', 'Lab Komputer 1', 40),
('R002', 'Lab Komputer 2', 40),
('R003', 'Ruang Teori 1', 50),
('R004', 'Ruang Teori 2', 50),
('R005', 'Aula', 100),
('R006', 'Ruang Multimedia', 30),
('R007', 'Lab Jaringan', 30),
('R008', 'Ruang Kelas 1', 45),
('R009', 'Ruang Kelas 2', 45),
('R010', 'Ruang Kelas 3', 45);

-- --------------------------------------------------------

--
-- Table structure for table `golongan`
--

CREATE TABLE `golongan` (
  `id_golongan` int(11) NOT NULL,
  `nama_golongan` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `golongan`
--

INSERT INTO `golongan` (`id_golongan`, `nama_golongan`) VALUES
(1, 'A1'),
(2, 'A2'),
(3, 'B1'),
(4, 'B2'),
(5, 'C1'),
(6, 'C2'),
(7, 'D1'),
(8, 'D2'),
(9, 'E1'),
(10, 'E2');

-- --------------------------------------------------------

--
-- Table structure for table `jadwal_kuliah`
--

CREATE TABLE `jadwal_kuliah` (
  `id_jadwal` int(11) NOT NULL,
  `kode_mk` varchar(10) NOT NULL,
  `nip_dosen` varchar(20) NOT NULL,
  `kode_ruang` varchar(10) NOT NULL,
  `id_golongan` int(11) NOT NULL,
  `hari` enum('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu') NOT NULL,
  `jam_mulai` time NOT NULL,
  `jam_selesai` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jadwal_kuliah`
--

INSERT INTO `jadwal_kuliah` (`id_jadwal`, `kode_mk`, `nip_dosen`, `kode_ruang`, `id_golongan`, `hari`, `jam_mulai`, `jam_selesai`) VALUES
(1, 'IF001', 'D001', 'R001', 1, 'Senin', '08:00:00', '10:00:00'),
(2, 'IF002', 'D002', 'R002', 2, 'Selasa', '10:00:00', '12:00:00'),
(3, 'SI001', 'D003', 'R003', 3, 'Rabu', '13:00:00', '15:00:00'),
(4, 'MI001', 'D004', 'R004', 4, 'Kamis', '09:00:00', '11:00:00'),
(5, 'TK001', 'D005', 'R007', 5, 'Jumat', '08:00:00', '10:00:00'),
(6, 'UM001', 'D006', 'R008', 1, 'Senin', '10:00:00', '12:00:00'),
(7, 'IF003', 'D001', 'R001', 2, 'Rabu', '08:00:00', '10:00:00'),
(8, 'IF004', 'D007', 'R007', 3, 'Selasa', '13:00:00', '15:00:00'),
(9, 'SI002', 'D008', 'R003', 4, 'Kamis', '13:00:00', '15:00:00'),
(10, 'UM002', 'D009', 'R008', 5, 'Jumat', '10:00:00', '12:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `krs`
--

CREATE TABLE `krs` (
  `id_krs` int(11) NOT NULL,
  `nim` varchar(20) NOT NULL,
  `id_jadwal` int(11) NOT NULL,
  `semester` int(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `krs`
--

INSERT INTO `krs` (`id_krs`, `nim`, `id_jadwal`, `semester`) VALUES
(1, '11220001', 1, 1),
(2, '11220001', 6, 1),
(3, '11220002', 2, 1),
(4, '11220002', 7, 1),
(5, '11220003', 3, 2),
(6, '11220003', 8, 2),
(7, '11220004', 4, 2),
(8, '11220004', 9, 2),
(9, '11220005', 5, 3),
(10, '11220005', 10, 3);

-- --------------------------------------------------------

--
-- Table structure for table `presensi`
--

CREATE TABLE `presensi` (
  `id_presensi` int(11) NOT NULL,
  `id_jadwal` int(11) NOT NULL,
  `nim` varchar(20) NOT NULL,
  `tanggal` date NOT NULL,
  `status` enum('Hadir','Sakit','Izin','Alpa') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `presensi`
--

INSERT INTO `presensi` (`id_presensi`, `id_jadwal`, `nim`, `tanggal`, `status`) VALUES
(1, 1, '11220001', '2023-10-02', 'Hadir'),
(2, 1, '11220001', '2023-10-09', 'Hadir'),
(3, 2, '11220002', '2023-10-03', 'Hadir'),
(4, 2, '11220002', '2023-10-10', 'Alpa'),
(5, 3, '11220003', '2023-10-04', 'Sakit'),
(6, 3, '11220003', '2023-10-11', 'Hadir'),
(7, 4, '11220004', '2023-10-05', 'Izin'),
(8, 4, '11220004', '2023-10-12', 'Hadir'),
(9, 5, '11220005', '2023-10-06', 'Hadir'),
(10, 5, '11220005', '2023-10-13', 'Hadir');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `dosen`
--
ALTER TABLE `dosen`
  ADD PRIMARY KEY (`nip`);

--
-- Indexes for table `mahasiswa`
--
ALTER TABLE `mahasiswa`
  ADD PRIMARY KEY (`nim`);

--
-- Indexes for table `matakuliah`
--
ALTER TABLE `matakuliah`
  ADD PRIMARY KEY (`kode_mk`);

--
-- Indexes for table `ruang`
--
ALTER TABLE `ruang`
  ADD PRIMARY KEY (`kode_ruang`);

--
-- Indexes for table `golongan`
--
ALTER TABLE `golongan`
  ADD PRIMARY KEY (`id_golongan`);

--
-- Indexes for table `jadwal_kuliah`
--
ALTER TABLE `jadwal_kuliah`
  ADD PRIMARY KEY (`id_jadwal`),
  ADD KEY `kode_mk` (`kode_mk`),
  ADD KEY `nip_dosen` (`nip_dosen`),
  ADD KEY `kode_ruang` (`kode_ruang`),
  ADD KEY `id_golongan` (`id_golongan`);

--
-- Indexes for table `krs`
--
ALTER TABLE `krs`
  ADD PRIMARY KEY (`id_krs`),
  ADD KEY `nim` (`nim`),
  ADD KEY `id_jadwal` (`id_jadwal`);

--
-- Indexes for table `presensi`
--
ALTER TABLE `presensi`
  ADD PRIMARY KEY (`id_presensi`),
  ADD KEY `id_jadwal` (`id_jadwal`),
  ADD KEY `nim` (`nim`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `golongan`
--
ALTER TABLE `golongan`
  MODIFY `id_golongan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `jadwal_kuliah`
--
ALTER TABLE `jadwal_kuliah`
  MODIFY `id_jadwal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `krs`
--
ALTER TABLE `krs`
  MODIFY `id_krs` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `presensi`
--
ALTER TABLE `presensi`
  MODIFY `id_presensi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `dosen`
--
ALTER TABLE `dosen`
  ADD CONSTRAINT `dosen_ibfk_1` FOREIGN KEY (`nip`) REFERENCES `users` (`username`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `mahasiswa`
--
ALTER TABLE `mahasiswa`
  ADD CONSTRAINT `mahasiswa_ibfk_1` FOREIGN KEY (`nim`) REFERENCES `users` (`username`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `jadwal_kuliah`
--
ALTER TABLE `jadwal_kuliah`
  ADD CONSTRAINT `jadwal_kuliah_ibfk_1` FOREIGN KEY (`kode_mk`) REFERENCES `matakuliah` (`kode_mk`),
  ADD CONSTRAINT `jadwal_kuliah_ibfk_2` FOREIGN KEY (`nip_dosen`) REFERENCES `dosen` (`nip`),
  ADD CONSTRAINT `jadwal_kuliah_ibfk_3` FOREIGN KEY (`kode_ruang`) REFERENCES `ruang` (`kode_ruang`),
  ADD CONSTRAINT `jadwal_kuliah_ibfk_4` FOREIGN KEY (`id_golongan`) REFERENCES `golongan` (`id_golongan`);

--
-- Constraints for table `krs`
--
ALTER TABLE `krs`
  ADD CONSTRAINT `krs_ibfk_1` FOREIGN KEY (`nim`) REFERENCES `mahasiswa` (`nim`),
  ADD CONSTRAINT `krs_ibfk_2` FOREIGN KEY (`id_jadwal`) REFERENCES `jadwal_kuliah` (`id_jadwal`);

--
-- Constraints for table `presensi`
--
ALTER TABLE `presensi`
  ADD CONSTRAINT `presensi_ibfk_1` FOREIGN KEY (`id_jadwal`) REFERENCES `jadwal_kuliah` (`id_jadwal`),
  ADD CONSTRAINT `presensi_ibfk_2` FOREIGN KEY (`nim`) REFERENCES `mahasiswa` (`nim`);
COMMIT; 