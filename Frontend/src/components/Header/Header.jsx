import React, { useState, useEffect } from "react";
import "./Header.css";

const Header = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "/images/salad4.webp",
      title: "Lựa chọn tốt cho sức khỏe",
      description:
        "Lựa chọn hoàn hảo cho vóc dáng cân đối và lối sống lành mạnh, với nguyên liệu tươi sạch, ít dầu mỡ nhưng đầy đủ dinh dưỡng!",
      buttonText: "Xem thực đơn",
      buttonLink: "food-display",
    },
    {
      image: "/images/mochi.jpg",
      title: "Nơi vị ngọt là nguồn cảm hứng bất tận",
      description: "Ngọt ngào từng chiếc, yêu ngay từ miếng đầu tiên!",
      buttonText: "Đặt bàn ngay",
      buttonLink: "reservation-section",
    },
    {
      image: "/images/buncha.jpg",
      title: "Đậm Đà, Hấp Dẫn, Không Thể Bỏ Lỡ!",
      description:
        "Những bữa ăn hấp dẫn, bổ dưỡng, được chế biến tỉ mỉ và chu đáo.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  const handleScroll = (elementId) => {
    if (!elementId?.startsWith("/")) {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  return (
    <div className="header">
      <div className="slideshow-container">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? "active" : ""}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}
      </div>
      <div className="header-contents">
        <div className="slide-content">
          <h2>{slides[currentSlide].title}</h2>
          <p>{slides[currentSlide].description}</p>
          {slides[currentSlide].buttonText && (
            <button
              className="cta-button"
              onClick={() => handleScroll(slides[currentSlide].buttonLink)}
            >
              {slides[currentSlide].buttonText}
            </button>
          )}
        </div>
        <div className="slide-indicators">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`indicator ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Header;
