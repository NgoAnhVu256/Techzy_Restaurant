# Hướng dẫn cấu hình AWS S3 cho Upload Ảnh

## 1. Tạo AWS S3 Bucket

1. Đăng nhập vào AWS Console
2. Vào dịch vụ S3
3. Tạo bucket mới với tên duy nhất (ví dụ: `techzy-restaurant-images`)
4. Cấu hình bucket:
   - **Block Public Access**: Tắt để cho phép public read
   - **Bucket Policy**: Thêm policy sau để cho phép public read:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

## 2. Tạo IAM User và Access Keys

1. Vào IAM Console
2. Tạo user mới (ví dụ: `s3-upload-user`)
3. Gắn policy `AmazonS3FullAccess` hoặc tạo custom policy chỉ cho phép upload vào bucket cụ thể
4. Tạo Access Key ID và Secret Access Key
5. **Lưu lại** Access Key ID và Secret Access Key (chỉ hiển thị 1 lần)

## 3. Cấu hình biến môi trường

Thêm các biến sau vào file `.env` trong thư mục `Backend/`:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=techzy-restaurant-images
```

### Giải thích các biến:

- `AWS_ACCESS_KEY_ID`: Access Key ID của IAM user
- `AWS_SECRET_ACCESS_KEY`: Secret Access Key của IAM user
- `AWS_REGION`: Region của S3 bucket (ví dụ: `us-east-1`, `ap-southeast-1`)
- `S3_BUCKET_NAME`: Tên bucket S3 đã tạo

## 4. Kiểm tra cấu hình

Sau khi cấu hình xong, khởi động lại server backend và thử upload ảnh. Ảnh sẽ được lưu vào S3 và URL đầy đủ sẽ được lưu vào database.

## 5. Lưu ý bảo mật

- **KHÔNG** commit file `.env` vào Git
- File `.env` đã được thêm vào `.gitignore`
- Chỉ chia sẻ Access Keys với người cần thiết
- Xem xét sử dụng IAM roles thay vì Access Keys nếu deploy lên EC2/ECS

## 6. Troubleshooting

### Lỗi: "Access Denied"
- Kiểm tra IAM user có quyền upload vào bucket
- Kiểm tra bucket policy cho phép public read

### Lỗi: "Bucket not found"
- Kiểm tra tên bucket trong `.env` đúng chính xác
- Kiểm tra region đúng với region của bucket

### Ảnh không hiển thị
- Kiểm tra bucket policy cho phép public read
- Kiểm tra URL trong database là URL đầy đủ từ S3

