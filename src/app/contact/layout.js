// app/layout.js (Next.js with app directory structure)
export default function ContactLayout({ children }) {
    return (
      <div className="min-h-screen flex flex-col">  
        {children}
      </div>
    );
  }
  