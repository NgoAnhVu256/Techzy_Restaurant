import React, { useEffect, useRef } from "react";
import "./AboutUs.css";
import { assets } from "../../assets/assets";

const AboutUs = () => {
  const aboutRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    if (aboutRef.current) {
      observer.observe(aboutRef.current);
    }

    // Handle navbar click animation
    const handleNavClick = () => {
      if (aboutRef.current) {
        aboutRef.current.classList.add("fade-in");
      }
    };

    window.addEventListener("aboutUsClick", handleNavClick);

    return () => {
      if (aboutRef.current) {
        observer.unobserve(aboutRef.current);
      }
      window.removeEventListener("aboutUsClick", handleNavClick);
    };
  }, []);

  return (
    <div id="about-us" className="about-us-container" ref={aboutRef}>
      <div className="about-content">
        <div className="about-text">
          <p>
            Trang web nhà hàng này được phát triển như một phần của đồ án cơ sở,
            với mục tiêu xây dựng một hệ thống đặt bàn và quản lý nhà hàng trực
            tuyến đơn giản nhưng hiệu quả. Đây là sản phẩm mô phỏng quá trình số
            hóa hoạt động vận hành của một nhà hàng hiện đại.{" "}
          </p>
          <p>
            Ý tưởng khởi nguồn từ nhu cầu kết nối giữa khách hàng và nhà hàng
            một cách thuận tiện hơn thông qua nền tảng web. Giao diện được thiết
            kế thân thiện với người dùng, nội dung rõ ràng, cho phép người dùng
            dễ dàng tìm hiểu thực đơn, đặt bàn và liên hệ.
          </p>
          <p>
            Hệ thống được lập trình bằng ReactJS cho phần giao diện và tích hợp
            các công nghệ cơ bản để xử lý biểu mẫu, xác thực đầu vào và hiển thị
            thông tin linh hoạt. Việc sử dụng các công cụ thiết kế như StarUML
            cũng hỗ trợ quá trình phân tích, thiết kế hệ thống một cách khoa
            học.
          </p>
          <p>
            Thông qua đồ án này, nhóm thực hiện mong muốn thể hiện khả năng ứng
            dụng kiến thức lập trình, thiết kế phần mềm và tư duy người dùng vào
            một sản phẩm thực tiễn. Trang web là bước đầu trong việc tiếp cận
            các giải pháp công nghệ cho ngành dịch vụ ăn uống.{" "}
          </p>
        </div>
        <div className="about-image">
          <img src={assets.about_us_chef} alt="Our Restaurant" />
          <img src={assets.about_us_table} alt="Our Restaurant" />
          <img src={assets.about_us_kitchen} alt="Our Restaurant" />
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
