import React, { useState } from 'react'
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  CheckCircle2,
  Calendar,
  Trash2,
  Edit2,
  Shield,
  Activity,
  Award
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { User, Role } from '@/types'

export const PJView: React.FC = () => {
  const { users, schedules, addUser, updateUser, deleteUser } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<Role>('pj')
  const [avatar, setAvatar] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')

  const openAddModal = () => {
    setUserToEdit(null)
    setName('')
    setEmail('')
    setPhone('')
    setRole('pj')
    setAvatar(`https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`)
    setStatus('active')
    setIsModalOpen(true)
  }

  const openEditModal = (u: User) => {
    setUserToEdit(u)
    setName(u.name)
    setEmail(u.email)
    setPhone(u.phone || '')
    setRole(u.role)
    setAvatar(u.avatar)
    setStatus(u.status || 'active')
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      toast.error('Data Belum Lengkap', 'Nama dan email wajib diisi.')
      return
    }

    if (userToEdit) {
      updateUser(userToEdit.id, {
        name,
        email,
        phone,
        role,
        avatar: avatar || userToEdit.avatar,
        status
      })
      toast.success('Data PJ Diperbarui', `Informasi ${name} telah disimpan.`)
    } else {
      addUser({
        name,
        email,
        phone: phone || '6281234567890',
        role,
        avatar:
          avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status,
        tasksCompleted: 0
      })
      toast.success('PJ Ditambahkan', `Anggota baru ${name} siap ditugaskan.`)
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Hapus anggota PJ "${name}"?`)) {
      deleteUser(id)
      toast.success('PJ Dihapus', `${name} telah dihapus dari daftar.`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Manajemen Penanggung Jawab (PJ)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Daftar petugas, beban kerja, histori tugas, dan informasi kontak WhatsApp.
          </p>
        </div>

        <Button onClick={openAddModal} size="sm" className="text-xs self-start sm:self-auto">
          <UserPlus className="w-3.5 h-3.5" /> Tambah Anggota PJ
        </Button>
      </div>

      {/* PJ Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map((user) => {
          const userSchedules = schedules.filter((s) => s.pj_ids.includes(user.id))
          const completedTasks = user.tasksCompleted || 0

          return (
            <Card
              key={user.id}
              className="p-5 flex flex-col justify-between hover:border-emerald-500/50 transition duration-150 relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Header Profile */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/20 shadow-xs"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {user.name}
                        {user.role === 'admin' && (
                          <span title="Admin">
                            <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                    </div>
                  </div>

                  <Badge variant={user.status === 'active' ? 'success' : 'outline'}>
                    {user.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                  </Badge>
                </div>

                {/* Contact Info */}
                <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>

                {/* Workload Metric */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Beban Tugas Aktif:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {userSchedules.length} Jadwal
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Total Piket Selesai:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      {completedTasks}x
                    </span>
                  </div>
                </div>

                {/* Latest Scheduled Activity */}
                {userSchedules.length > 0 && (
                  <div className="text-[11px] text-slate-500 space-y-1">
                    <span className="font-semibold text-slate-400">Tugas Berikutnya:</span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium truncate">
                      • {userSchedules[0].title} ({userSchedules[0].activity_date})
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <a
                  href={`https://wa.me/${user.phone?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" /> Chat WA
                </a>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(user)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit Profil PJ"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id, user.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Hapus PJ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Member Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={userToEdit ? 'Edit Data Penanggung Jawab' : 'Tambah Penanggung Jawab (PJ) Baru'}
        description="Lengkapi identitas anggota untuk penugasan piket dan otomatisasi WhatsApp."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap *"
            placeholder="Contoh: Muhammad Rois"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Alamat Email *"
            type="email"
            placeholder="Contoh: rois@organisasi.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Nomor WhatsApp (Aktif) *"
            placeholder="Contoh: 6281234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            helper="Format internasional dengan 62 (contoh: 6281234567890)"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Peran / Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="pj">Petugas PJ</option>
                <option value="admin">Administrator</option>
                <option value="member">Anggota Biasa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="active">Aktif Bertugas</option>
                <option value="inactive">Cuti / Non-Aktif</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">{userToEdit ? 'Simpan Data' : 'Tambah Anggota'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
