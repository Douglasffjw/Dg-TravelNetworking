export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div 
        className="w-16 h-16 border-4 border-t-4 border-t-[#394C97] border-gray-200 border-solid rounded-full animate-spin"
        role="status"
      >
        <span className="sr-only">Carregando...</span>
      </div>
      <p className="ml-4 text-[#394C97] font-medium">Verificando acesso...</p>
    </div>
  );
}