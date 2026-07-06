
import { Mail, Phone, Info } from 'lucide-react';
import '../assets/styles/Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="footer-wrapper">
      <div className="container">
        <div className="footer-row">
          
          {/* CỘT 1: THÔNG TIN DỰ ÁN */}
          <div className="footer-col-main">
            <div className="logo-section">
              <h2 className="project-name">Fingerspelling ASL</h2>
              <div className="info">
                <p><b>Dự án cá nhân:</b> Ứng dụng hỗ trợ học và luyện tập Bảng chữ cái Ngôn ngữ ký hiệu của Mỹ (ASL).</p>
                <div><b>Phát triển bởi:</b> Phan Khải Điền</div>
                <div><b>Mục tiêu:</b> Mang lại công cụ học tập trực quan, dễ tiếp cận cho cộng đồng người quan tâm đến ngôn ngữ ký hiệu.</div>
              </div>
            </div>

            {/* Copyright trên Desktop */}
            <div className="ecosystem-copy-right desktop-only">
              <div className="copy-right">
                <span>© {year} Phan Khai Dien. <br />All rights reserved.</span>
              </div>
            </div>
          </div>

          {/* CỘT 2: MENU ĐIỀU HƯỚNG */}
          <div className="footer-col-menu">
            <div className="menu-footer">
              <div className="menu-item">
                <div className="header">
                  <p className="menu-title">TÍNH NĂNG</p>
                </div>
                <div className="sub-menu">
                  <ul className="menu">
                    <li className="menu-item"><a href="#learn">Học bảng chữ cái</a></li>
                    <li className="menu-item"><a href="#practice">Luyện tập (Practice)</a></li>
                    <li className="menu-item"><a href="#quiz">Kiểm tra (Quiz)</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="menu-item mt-4">
                <div className="header">
                  <p className="menu-title">TÀI LIỆU</p>
                </div>
                <div className="sub-menu">
                  <ul className="menu">
                    <li className="menu-item"><a href="https://github.com/PhanKhaiDIen" target="_blank" rel="noopener noreferrer">Mã nguồn (GitHub)</a></li>
                    <li className="menu-item"><a href="#about">Về dự án này</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT 3: THÔNG TIN LIÊN HỆ */}
          <div className="footer-col-contact">
            <div className="cskh">
              <div className="hotline-email">
                <div className="hotline-title">THÔNG TIN LIÊN HỆ</div>
                <div className="hotline">
                  <a href="tel:+84332605243">
                    <Phone size={18} />
                    <span>0332 605 243</span>
                  </a>
                </div>
                <div className="email">
                  <a href="mailto:phankhaidien252@gmail.com">
                    <Mail size={18} />
                    <span>phankhaidien252@gmail.com</span>
                  </a>
                </div>
              </div>

              <div className="connect-vf">
                <div className="connect-title">KẾT NỐI VỚI TÔI</div>
                <div className="social">
                  {/* Icon Facebook SVG */}
                  <a className="social-item" href="https://www.facebook.com/khaidien.phan/" target="_blank" rel="noopener noreferrer" title="Facebook">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>
                  {/* Icon GitHub SVG */}
                  <a className="social-item" href="https://github.com/PhanKhaiDIen" target="_blank" rel="noopener noreferrer" title="GitHub">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.41 7.86 10.94.58.11.79-.25.79-.56 0-.28-.01-1.03-.02-2.02-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.72-1.55-2.55-.29-5.23-1.27-5.23-5.65 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.18 1.17a11.03 11.03 0 015.8 0c2.2-1.48 3.17-1.17 3.17-1.17.63 1.59.24 2.77.12 3.06.73.8 1.18 1.82 1.18 3.07 0 4.39-2.69 5.36-5.25 5.64.41.36.77 1.08.77 2.18 0 1.57-.02 2.84-.02 3.23 0 .31.21.68.8.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
                    </svg>
                  </a>
                  {/* Icon Info từ Lucide */}
                  <a className="social-item" href="#about" title="About">
                    <Info size={20} />
                  </a>
                </div>
              </div>

              {/* Copyright trên Mobile */}
              <div className="ecosystem-copy-right mobile-only">
                <div className="copy-right mt-3">
                  <span>© {year} Phan Khai Dien. <br />All rights reserved.</span>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </footer>
  );
}