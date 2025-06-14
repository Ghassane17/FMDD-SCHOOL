import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Users, BookOpen, Calendar, Inbox, CreditCard, Settings, LogOut, User, Mail } from "lucide-react"

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';


export function DropDownInstructor({ currentInstructor }) {
  const navigate = useNavigate();
  const backend_url = API_URL;

  const avatar = currentInstructor.avatar;
  let avatar_url = '/default-avatar.png';
  if (avatar) {
    avatar_url = avatar.startsWith('http') ? avatar : `${backend_url}${avatar}`;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none">
        <div className="h-10 w-10 rounded-full bg-white overflow-hidden border-2 border-indigo-200 shadow">
                                    {avatar_url ? (
                                        <img
                                            src={avatar_url}
                                            alt="Profile"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-full w-full p-1 text-indigo-400" />
                                    )}
                                </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/instructor/profile')}>
          <User className="w-4 h-4 mr-2" />
          My Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/instructor/settings')}>
          <Settings className="w-4 h-4 mr-2" />
          Account Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/instructor/contact')}>
          <Mail className="w-4 h-4 mr-2" />
          Contact Us
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('instructorStats');
          navigate('/login');
        }}>
          <LogOut className="w-4 h-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
