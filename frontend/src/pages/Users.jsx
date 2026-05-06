import { useEffect, useState } from 'react';
import { userService } from '../services';
import { formatDate } from '../utils/helpers';
import { Users as UsersIcon, Shield, UserX, Trash2, ShieldOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      toast.error(error.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await userService.deleteUser(userId);
      setUsers(users.filter((u) => u._id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage team members and roles</p>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                       {user.role === 'admin' ? (
                         <Shield className="w-4 h-4 text-red-500 mr-2" />
                       ) : (
                         <UsersIcon className="w-4 h-4 text-gray-400 mr-2" />
                       )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleRoleChange(
                            user._id,
                            user.role === 'admin' ? 'user' : 'admin'
                          )
                        }
                        className={`p-2 rounded-lg transition-colors ${
                          user.role === 'admin'
                            ? 'text-gray-600 hover:bg-gray-100'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      >
                        {user.role === 'admin' ? (
                          <ShieldOff className="w-4 h-4" />
                        ) : (
                          <Shield className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-12 text-center">
             <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">Users will appear here once registered.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
