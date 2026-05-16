import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow p-3 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-500">MemeUni</Link>
      <div className="flex items-center gap-4">
        <Link to="/upload" className="bg-blue-500 text-white px-3 py-1 rounded">Upload</Link>
        <span className="font-medium">{user?.username}</span>
        <button onClick={logout} className="text-red-500 bg-yellow-300 p-2">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;