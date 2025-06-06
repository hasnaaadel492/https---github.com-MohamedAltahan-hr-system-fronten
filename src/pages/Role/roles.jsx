import { useState } from 'react';
import { useGetAllRolesQuery, useDeleteRoleMutation } from '../../api/RolesApi';
import SectionBox from '../../components/ui/containers/SectionBox';
import AddingButton from '../../components/ui/buttons/AddingBtn';
import ProductTable from '../../components/reusable Component/DataTable';
import { MdEdit, MdDelete } from 'react-icons/md';
import ConfirmDialog from '../../components/Reusable Component/ConfirmDialog';
import { toast } from 'react-toastify';

const Roles = () => {
  const [page, setPage] = useState(1);
  const { data: rolesData, isLoading } = useGetAllRolesQuery({ page, per_page: 10 });
  const [deleteRole] = useDeleteRoleMutation();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await deleteRole(selectedId).unwrap();
      toast.success(res?.message || 'تم حذف الدور بنجاح');
    } catch (error) {
      toast.error(error?.data?.message || 'فشل في حذف الدور');
    } finally {
      setConfirmOpen(false);
    }
  };

  const roles = rolesData?.body || [];
  const pagination = rolesData?.body?.paginate;
  console.log(rolesData);
  

  const headers = [
    { key: 'title_ar', label: 'الاسم (AR)' },
    { key: 'title_en', label: 'الاسم (EN)' },
   
  ];

  const tableData = roles.map((role) => ({
    ...role,
    title_ar: role.translation?.title?.ar || role.title,
    title_en: role.translation?.title?.en || '',
    permissions: role.permissions.map((p) => p.title).join(', '),
  }));

  return (
    <SectionBox className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-2 items-center gap-4">
        <div className="containerTitle">إدارة الأدوار</div>
        <div className="flex justify-end">
          <a href="/app/role/add">
            <AddingButton variant="main">إضافة دور</AddingButton>
          </a>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <ProductTable
          headers={headers}
          data={tableData}
          rowKey="id"
          baseRoute="/app/role"
          pagination={pagination}
          onPageChange={(newPage) => setPage(Number(newPage))}
          renderActions={(item) => (
            <div className="flex gap-2 items-center">
              <a href={`/app/role/edit/${item.id}`} className="font-medium text-blue-600 hover:underline editIcon">
                <MdEdit />
              </a>
              <button onClick={() => handleDeleteClick(item.id)} className="deleteIcon">
                <MdDelete />
              </button>
            </div>
          )}
        />
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد أنك تريد حذف هذا الدور؟"
      />
    </SectionBox>
  );
};

export default Roles;
