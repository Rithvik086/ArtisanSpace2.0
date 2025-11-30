import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import api from "../../lib/axios";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import type { RootState } from "../../redux/store";

export default function CustomerHeader() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);

    const navItems = [
        { name: "Home", href: "/customer" },
        { name: "Store", href: "/customer/store" },
        { name: "Cart", href: "/customer/cart" },
        { name: "Workshop", href: "/customer/workshop" },
        { name: "Custom Order", href: "/customer/custom-order" },
    ];

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            dispatch(logout());
            navigate("/");
        } catch {
            dispatch(logout());
            navigate("/");
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm border-b">

            {/* THIS LINE WAS FIXED */}
            <div className="w-full px-4 sm:px-6 lg:px-8">

                <div className="flex justify-between items-center h-20">

                    {/* Logo */}
                    <Link to="/customer" className="flex items-center">
                        <h1 className="font-bold text-amber-950 text-3xl">
                            ArtisanSpace
                        </h1>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-10">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="text-lg font-semibold text-amber-900 hover:text-amber-950 transition"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Right Actions */}
                    <div className="hidden md:flex items-center gap-4">
            <span className="text-amber-900 font-medium">
              Welcome, {user?.name || user?.username}
            </span>

                        <button
                            onClick={() => navigate("/customer/settings")}
                            className="p-2 rounded-md hover:bg-amber-100"
                        >
                            <User size={20} className="text-amber-900" />
                        </button>

                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-md hover:bg-red-100"
                        >
                            <LogOut size={20} className="text-red-700" />
                        </button>
                    </div>

                    {/* Mobile Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-md hover:bg-amber-100"
                    >
                        {isOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t shadow">
                    <div className="px-4 py-3 space-y-2">

                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsOpen(false)}
                                className="block py-2 text-lg text-amber-900 hover:bg-amber-100 rounded"
                            >
                                {item.name}
                            </Link>
                        ))}

                        <hr className="my-2" />

                        <button
                            onClick={() => {
                                navigate("/customer/settings");
                                setIsOpen(false);
                            }}
                            className="flex items-center gap-2 w-full py-2 text-amber-900 hover:bg-amber-100 rounded"
                        >
                            <User size={20} />
                            Settings
                        </button>

                        <button
                            onClick={() => {
                                handleLogout();
                                setIsOpen(false);
                            }}
                            className="flex items-center gap-2 w-full py-2 text-red-700 hover:bg-red-100 rounded"
                        >
                            <LogOut size={20} />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
