# Hướng dẫn chi tiết thao tác dự án với Docker

Tài liệu này hướng dẫn bạn cách khởi chạy, quản lý và bảo trì hệ thống Quiz/MCQ bằng Docker.

## 1. Chuẩn bị trước khi chạy

Đảm bảo bạn đã cài đặt:

- **Docker Desktop** (trên Windows)
- File `.env` trong thư mục `server/` có đủ các biến môi trường cần thiết.

> [!IMPORTANT]
> Khi chạy bằng Docker Compose, hãy đặt `DB_HOST=db` trong file `.env` (vì `db` là tên service trong compose).

---

## 2. Các lệnh cơ bản với Docker Compose

Đây là cách dễ nhất để chạy toàn bộ cả API và Database mà không cần cài đặt MySQL lên máy thật.

### Khởi chạy hệ thống

```bash
# Chạy ở chế độ nền (detached)
docker-compose up -d

# Nếu bạn thay đổi file Dockerfile hoặc package.json, hãy build lại:
docker-compose up -d --build
```

### Kiểm tra trạng thái

```bash
# Xem các container đang chạy
docker-compose ps

# Xem log thực tế của API
docker-compose logs -f api

# Xem log của database
docker-compose logs -f db
```

### Dừng hệ thống

```bash
# Dừng container nhưng giữ nguyên dữ liệu
docker-compose stop

# Dừng và xóa container (vẫn giữ dữ liệu trong volume)
docker-compose down

# Dừng, xóa container và XÓA LUÔN DỮ LIỆU database
docker-compose down -v
```

---

## 3. Thao tác với Database (MySQL)

Dữ liệu được lưu trữ trong một "Docker Volume" gọi là `mysql_data`.

### Truy cập vào MySQL bên trong container

Nếu bạn muốn chạy lệnh SQL thủ công:

```bash
docker exec -it review-certs-db mysql -u root -p
# Sau đó nhập password bạn đã cấu hình trong .env (mặc định là rootpassword)
```

### Khởi tạo Database (Schema & Seed)

File `docker-compose.yml` đã được cấu hình tự động chạy các file trong `server/database/` khi lần đầu tạo container. Nếu bạn muốn chạy lại:

```bash
# Xóa container và volume cũ để nó chạy lại script init
docker-compose down -v
docker-compose up -d
```

---

## 4. Quản lý Docker Images (Dockerfile)

Nếu bạn chỉ muốn build riêng Image cho backend:

### Build Image

```bash
cd server
docker build -t review-certs-api:v1 .
```

### Các giai đoạn trong Dockerfile (Best Practice)

Dockerfile được viết theo kiểu **Multi-stage**:

1. **Stage 1 (deps):** Chỉ cài đặt thư viện. Giúp tận dụng cache của Docker (không cần cài lại node_modules mỗi khi sửa code).
2. **Stage 2 (production):** Copy thư viện từ Stage 1 sang một image sạch.
   - **Bảo mật:** Sử dụng user `expressjs` thay vì `root`.
   - **Nhẹ:** Sử dụng Alpine Linux.
   - **Healthcheck:** Tự động kiểm tra xem API có "sống" không (status 200).
