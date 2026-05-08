import { useUsers, useUpdateUserRole, useDeleteUser } from "../hooks/useUsers";
import { Card, CardBody, Button, Badge, Avatar, PageLoader, EmptyState } from "../components/ui";
import { Users, Trash2, Shield, ShieldOff } from "lucide-react";
import { formatDate } from "../lib/utils";

export default function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const handleRoleToggle = (userId, currentRole) => {
    updateRole.mutate({ userId, role: currentRole === "admin" ? "user" : "admin" });
  };

  const handleDelete = (userId) => {
    if (window.confirm("Delete this user?")) {
      deleteUser.mutate(userId);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500">Manage team members and roles</p>
      </div>

      {users?.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Users className="w-16 h-16" />}
              title="No users found"
              description="Users will appear here once registered."
            />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users?.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} />
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <Badge variant={user.role === "admin" ? "primary" : "default"}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRoleToggle(user._id, user.role)}
                            title={user.role === "admin" ? "Remove Admin" : "Make Admin"}
                          >
                            {user.role === "admin" ? (
                              <ShieldOff className="w-4 h-4" />
                            ) : (
                              <Shield className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user._id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}