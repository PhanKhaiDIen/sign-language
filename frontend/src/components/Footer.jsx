import { Mail, Phone } from 'lucide-react';
import '../assets/styles/Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">

        <div className="footer-brand">
          <span>Fingerspelling</span>
          <span>- Đồ án cá nhân bởi Khải Điền - {year}</span>
        </div>

        <div className="footer-links">

          {/* GitHub */}
          <a
            href="https://github.com/PhanKhaiDIen"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.41 7.86 10.94.58.11.79-.25.79-.56 0-.28-.01-1.03-.02-2.02-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.72-1.55-2.55-.29-5.23-1.27-5.23-5.65 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.18 1.17a11.03 11.03 0 015.8 0c2.2-1.48 3.17-1.17 3.17-1.17.63 1.59.24 2.77.12 3.06.73.8 1.18 1.82 1.18 3.07 0 4.39-2.69 5.36-5.25 5.64.41.36.77 1.08.77 2.18 0 1.57-.02 2.84-.02 3.23 0 .31.21.68.8.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
            </svg>
            GitHub
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/khaidien.phan/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
            </svg>
            Facebook
          </a>

          {/* Email */}
          <a
            href="mailto:phankhaidien252@gmail.com"
            className="footer-link"
          >
            <Mail size={16} />
            phankhaidien252@gmail.com
          </a>

          {/* Phone */}
          <a
            href="tel:+84332605243"
            className="footer-link"
          >
            <Phone size={16} />
            0332605243
          </a>

        </div>

      </div>
    </footer>
  );
}