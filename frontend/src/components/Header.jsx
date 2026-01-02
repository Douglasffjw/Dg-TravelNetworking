import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="w-full bg-transparent text-white px-6 py-4 flex justify-center items-center absolute top-[60px] left-0 z-40">

      <nav className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
        <ul className="flex space-x-8">
          {["Home", "Missions", "Rewards"].map((item, index) => (
            <li key={index}>
              <Link
                to={`/${item.toLowerCase()}`}
                className="relative text-lg font-medium hover:text-orange transition duration-300"
              >
                {item}
                <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-orange scale-x-0 hover:scale-x-100 origin-left transition-transform duration-300"></span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}