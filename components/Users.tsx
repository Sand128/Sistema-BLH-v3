import React, { useState } from 'react';
import { Plus, Search, Filter, Shield, User, List, Edit, Trash2, Key, Users as UsersIcon } from 'lucide-react';
import { User as UserType, Role } from '../types';
import UserForm from './UserForm';
import RoleEditor from './RoleEditor';
import AuditLog from './AuditLog';

// Mock Data
const MOCK_ROLES: Role[] = [
  { id: 'admin', name: 'Administrador del Sistema', description: 'Acceso total a todos los módulos y configuración.', permissions: ['all'], isSystem: true },
  { id: 'nurse', name: 'Enfermería/Lactario', description: 'Gestión de donadoras, frascos y administración.', permissions: ['donors:view', 'donors:create', 'jars:create'] },
  { id: 'lab', name: 'Químico/Laboratorio', description: 'Análisis fisicoquímico, pasteurización y cultivos.', permissions: ['jars:verify', 'batches:create', 'analysis:create'] },
];

const MOCK_USERS: UserType[] = [
  { id: '1', fullName: 'Ana López', email: 'ana.lopez@hospital.mx', hospitalId: '5', hospitalName: 'Mónica Pretelini', roles: ['nurse'], status: 'ACTIVE', twoFactorEnabled: true, employeeId: 'ENF-001' },
  { id: '2', fullName: 'Carlos Ruiz', email: 'carlos.ruiz@hospital.mx', hospitalId: '5', hospitalName: 'Mónica Pretelini', roles: ['lab'], status: 'ACTIVE', twoFactorEnabled: false, employeeId: 'QUI-001' },
  { id: '3', fullName: 'Admin Sistema', email: 'admin@salud.edomex.gob.mx', hospitalId: '0', hospitalName: 'ISEM Central', roles: ['admin'], status: 'ACTIVE', twoFactorEnabled: true, employeeId: 'ADM-001' },
];

type ViewState = 'USERS' | 'ROLES' | 'AUDIT';

const Users: React.FC = () => {
  const [view, setView] = useState<ViewState>('USERS');
  const [users, setUsers] = useState<UserType[]>(MOCK_USERS);
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  
  // Modals
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | undefined>(undefined);
  
  const [showRoleEditor, setShowRoleEditor] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | undefined>(undefined);

  const [searchTerm, setSearchTerm] = useState('');

  // User Handlers
  const handleSaveUser = (user: UserType) => {
    if (editingUser) {
      setUsers(users.map(u => u.id === user.id ? user : u));
    } else {
      setUsers([...users, user]);
    }
    setShowUserForm(false);
    setEditingUser(undefined);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('¿Está seguro de desactivar este usuario?')) {
      setUsers(users.map(u => u.id === id ? { ...u, status: 'INACTIVE' } : u));
    }
  };

  // Role Handlers
  const handleSaveRole = (role: Role) => {
    if (roles.find(r => r.id === role.id)) {
      setRoles(roles.map(r => r.id === role.id ? role : r));
    } else {
      setRoles([...roles, role]);
    }
    setShowRoleEditor(false);
    setEditingRole(undefined);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setShowRoleEditor(true);
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm inline-flex mb-2">
        <button 
          onClick={() => setView('USERS')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
            view === 'USERS' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <User size={16}/> Usuarios
        </button>
        <button 
          onClick={() => setView('ROLES')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
            view === 'ROLES' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Shield size={16}/> Roles y Permisos
        </button>
        <button 
          onClick={() => setView('AUDIT')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
            view === 'AUDIT' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <List size={16}/> Auditoría
        </button>
      </div>

      {/* --- USERS VIEW --- */}
      {view === 'USERS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Gestión de Usuarios</h2>
            <button 
              onClick={() => { setEditingUser(undefined); setShowUserForm(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
            >
              <Plus size={20} /> Nuevo Usuario
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Buscar usuario..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                <Filter size={18} /> Filtros
              </button>
            </div>

            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Roles</th>
                  <th className="px-6 py-4">Hospital</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{user.fullName}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map(rid => {
                          const role = roles.find(r => r.id === rid);
                          return (
                            <span key={rid} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs border border-slate-200">
                              {role?.name || rid}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.hospitalName}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold
                        ${user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}
                      `}>
                        {user.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingUser(user); setShowUserForm(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit size={18}/>
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ROLES VIEW --- */}
      {view === 'ROLES' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Roles y Permisos</h2>
            <button 
              onClick={() => { 
                setEditingRole({ id: Date.now().toString(), name: '', description: '', permissions: [] }); 
                setShowRoleEditor(true); 
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
            >
              <Plus size={20} /> Nuevo Rol
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map(role => (
              <div key={role.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                    <Shield size={24}/>
                  </div>
                  {role.isSystem ? (
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded border border-amber-200">
                      SISTEMA
                    </span>
                  ) : (
                    <button onClick={() => handleEditRole(role)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg">
                      <Edit size={18}/>
                    </button>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{role.name}</h3>
                <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{role.description}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-2 rounded-lg">
                  <Key size={14}/>
                  {role.permissions.includes('all') ? 'Acceso Total' : `${role.permissions.length} permisos asignados`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- AUDIT VIEW --- */}
      {view === 'AUDIT' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Bitácora de Auditoría</h2>
          </div>
          <AuditLog />
        </div>
      )}

      {/* Modals */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            <UserForm 
              initialData={editingUser}
              roles={roles}
              onSubmit={handleSaveUser}
              onCancel={() => setShowUserForm(false)}
            />
          </div>
        </div>
      )}

      {showRoleEditor && editingRole && (
        <RoleEditor 
          role={editingRole}
          onSave={handleSaveRole}
          onCancel={() => setShowRoleEditor(false)}
        />
      )}

    </div>
  );
};

export default Users;