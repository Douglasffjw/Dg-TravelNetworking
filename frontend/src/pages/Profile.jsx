import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cog6ToothIcon,
  PencilSquareIcon,
  UserCircleIcon,
  CameraIcon,
  CheckIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import api from "../api/api"; // Usado para o GET inicial

export default function Profile() {
  const getLevel = (points) => Math.floor((points || 0) / 1000);
  const getProgress = (points) => ((points || 0) % 1000) / 10;

  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estado do formulário
  const [form, setForm] = useState({
    name: "",
    email: "",
    description: "",
    image: "", // URL ou Preview
    imageFile: null, // Arquivo real para upload
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Texto padrão caso o usuário não tenha Bio
  const getDescricaoPadrao = (name) => {
    if (!name) return "Membro da Escola de Empreendedores";
    if (name.includes("Carlos")) return "Empreendedor";
    if (name.includes("Ana")) return "UX/UI Designer apaixonada por inovação";
    return "Membro da Escola de Empreendedores";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    /* (Lógica de Proteção)
    if (!token) {
      navigate("/login");
      return;
    }
    */

    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        const data = res.data;

        /*
        // **NOVA LÓGICA DE REDIRECIONAMENTO AQUI** 👈
        if (data.role === "admin") {
          navigate("/admin");
          return;
        }
        // Se o usuário não for 'admin', mas for um participante...
        // ... ele deve ser redirecionado para /missions.
        // Já que ele já está em /profile (por engano), podemos forçar o redirecionamento.
        if (data.role !== "admin") {
          navigate("/missions");
          return;
        }
        */

        // Lógica de Prioridade: Se tiver 'curiosidades' no banco, usa. Senão, usa o padrão.
        const descricaoFinal = data.curiosidades || getDescricaoPadrao(data.nome);

        const enrichedUser = {
          ...data,
          name: data.nome,
          pontos: data.pontos || 0,
          description: descricaoFinal,
          image: data.foto_url || "",
        };

        setUser(enrichedUser);
        setForm({
          name: enrichedUser.name,
          email: enrichedUser.email,
          description: enrichedUser.description,
          image: enrichedUser.image,
          imageFile: null,
        });
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
        /*
        // Se der erro 401, redireciona
        if (err.response && err.response.status === 401) {
          navigate("/login");
        }
        */
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Mapeando para os campos que o backend espera (nome, curiosidades)
      formData.append("nome", form.name);
      formData.append("curiosidades", form.description);

      if (form.imageFile) {
        formData.append("file", form.imageFile);
      }

      // Usando FETCH nativo para evitar erros de boundary no Axios
      const response = await fetch("http://localhost:3001/api/users/me", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
          // Não definimos Content-Type aqui, o navegador define automaticamente
        },
        body: formData
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Erro ${response.status}: ${errText}`);
      }

      const updatedData = await response.json();

      // Atualiza o estado local com os dados confirmados pelo backend
      setUser((prev) => ({
        ...prev,
        name: updatedData.nome,
        // Se o backend devolveu nova URL de foto, usa ela. Senão mantém a atual.
        image: updatedData.foto_url || prev.image,
        description: form.description
      }));

      setIsEditing(false);
      setForm(prev => ({ ...prev, imageFile: null })); // Limpa o arquivo da memória

      alert("Perfil atualizado com sucesso!");

    } catch (error) {
      console.error("Erro ao salvar:", error);
      if (error.message.includes("401")) {
        navigate("/login");
      } else {
        alert("Erro ao salvar alterações. Verifique sua conexão.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reverte o formulário para os dados originais do usuário
    setForm({
      name: user.name,
      email: user.email,
      description: user.description,
      image: user.image,
      imageFile: null,
    });
    setIsEditing(false);
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const getInitials = (name) =>
    name
      ? name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
      : "US";

  // Configuração do Dropzone (Upload de imagem)
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);

      // Salva tanto o preview (para mostrar agora) quanto o arquivo (para enviar depois)
      setForm((prev) => ({
        ...prev,
        image: previewUrl,
        imageFile: file
      }));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: !isEditing, // Só permite arrastar foto se estiver editando
    accept: { 'image/*': [] }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#394C97]"></div>
      </div>
    );
  }

  // Proteção se o usuário não carregar
  if (!user) return null;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* Banner Superior */}
      <div className="h-48 w-full bg-[#394C97] relative">
        <div className="absolute top-4 right-4 text-white/80 text-sm">
          Atlântico Avanti Perfil
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 mb-6 flex flex-col md:flex-row items-end md:items-end gap-6">

          {/* Avatar Section */}
          <div className="relative group">
            <div
              {...getRootProps()}
              className={`w-40 h-40 rounded-full border-[6px] border-white bg-gray-100 overflow-hidden shadow-md flex items-center justify-center relative
                ${isEditing ? "cursor-pointer hover:border-gray-200 transition-colors" : ""} 
                ${isDragActive ? "border-[#FE5900]" : ""}`}
            >
              <input {...getInputProps()} />

              {form.image ? (
                <img
                  src={form.image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-[#394C97]">{getInitials(user?.name)}</span>
              )}

              {/* Overlay de Edição de Foto */}
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <CameraIcon className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Nome e Descrição */}
          <div className="flex-1 pb-4 text-center md:text-left md:translate-y-2">
            <h1 className="text-3xl font-bold text-[#394C97] mb-1">
              {user.name}
            </h1>
            <p className="text-gray-500 font-medium text-lg">
              {user.description}
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="pb-6 flex gap-3 md:translate-y-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-[#394C97] text-white rounded-lg hover:bg-[#2d3b75] transition shadow-sm font-medium"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                  Editar Perfil
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-6 py-2 bg-[#FE5900] text-white rounded-lg hover:bg-[#e04f00] transition shadow-sm font-medium ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? (
                    "Salvando..."
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5" />
                      Salvar
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  <XMarkIcon className="h-5 w-5" />
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Grid de Conteúdo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 pb-20">

          {/* Coluna Esquerda: Informações / Formulário */}
          <div className="md:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold text-[#394C97] mb-6 border-b pb-2">
                Informações Pessoais
              </h2>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={handleChange("name")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#394C97] focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Sobre</label>
                    <textarea
                      value={form.description}
                      onChange={handleChange("description")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-[#394C97] focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Email</p>
                      <p className="text-gray-800 font-medium mt-1">{user.email}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">User ID</p>
                      <p className="text-gray-800 font-medium mt-1 font-mono text-sm">{user.id}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Bio</p>
                    <p className="text-gray-800 mt-1">{user.description}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Coluna Direita: Status e Logout */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#394C97] mb-6">Estatísticas</h2>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-gray-600 font-medium">Nível</span>
                    <span className="text-3xl font-bold text-[#394C97]">{getLevel(user.pontos)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-[#394C97] h-2.5 rounded-full transition-all duration-1000"
                      style={{ width: `${getProgress(user.pontos)}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-xs text-gray-500 mt-1">
                    {Math.round(getProgress(user.pontos))}% para o próximo nível
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-gray-600 font-medium mb-1">Pontuação Total</p>
                  <p className="text-2xl font-bold text-[#FE5900]">{user.pontos}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition font-medium"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Sair da Conta
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}