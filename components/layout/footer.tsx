import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Logo size="sm" />
            <p className="max-w-xs text-sm leading-relaxed text-slate-600">
              AI-powered adaptive learning for Cameroon GCE students. Study
              smarter, pass better.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Platform</h4>
            <ul className="space-y-2">
              {["Features", "Pricing", "About"].map((item) => (
                <li key={item}>
                  <Link
                    href={`#${item.toLowerCase()}`}
                    className="text-sm text-slate-600 transition-colors hover:text-blue-600"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Resources</h4>
            <ul className="space-y-2">
              {["Blog", "Documentation", "Help Center"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-slate-600 transition-colors hover:text-blue-600"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Legal</h4>
            <ul className="space-y-2">
              {["Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-slate-600 transition-colors hover:text-blue-600"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200/80 pt-6 text-center">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Pi Learning. Built for Cameroon
            GCE students.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
