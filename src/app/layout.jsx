import "@/app/globals.css";
import { Bodoni_Moda, Poppins, Manrope } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-bodoni",
});

const fontManrop = Manrope({
  subsets: ["latin"],
  weight: ["200", "400", "500", "300", "700"],
  variable: "--font-manrope",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "600", "200", "500", "800"],
});

export const metadata = {
  title: "Mini Dash",
  description: "Seu dashboard inteligente",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${bodoni.variable} ${poppins.variable} ${fontManrop.variable} dark`}
    >
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
