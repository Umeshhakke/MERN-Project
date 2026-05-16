import { NavLink } from 'react-router-dom';
import { FaHome, FaSearch, FaPlusSquare, FaCommentDots, FaUser } from 'react-icons/fa';

const BottomNav = () => {
  const tabs = [
    { to: '/', label: 'Feed', Icon: FaHome },
    { to: '/search', label: 'Search', Icon: FaSearch },
    { to: '/upload', label: 'Upload', Icon: FaPlusSquare, isCenter: true },
    { to: '/chat', label: 'Chat', Icon: FaCommentDots },
    { to: '/profile', label: 'Profile', Icon: FaUser },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-14 z-50">
      {tabs.map(({ to, label, Icon, isCenter }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full ${
              isActive ? 'text-blue-500' : 'text-gray-500'
            }`
          }
        >
          {isCenter ? (
            <div className="bg-blue-500 text-white p-2 rounded-full -mt-5 shadow-lg">
              <Icon className="text-xl" />
            </div>
          ) : (
            <Icon className="text-xl" />
          )}
          <span className="text-xs mt-0.5">{label}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default BottomNav;