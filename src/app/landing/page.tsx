"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  BarChart3, 
  FileText, 
  ShoppingCart, 
  Users, 
  Star,
  ArrowRight,
  Shield,
  Zap,
  TrendingUp,
  Mail,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou senha incorretos");
      } else {
        // Verificar se login foi bem-sucedido
        const session = await getSession();
        if (session) {
          router.push("/");
        }
      }
    } catch (error) {
      setError("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleTesteDemoLogin = async () => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: "admin@sistema.com",
        password: "123456",
        redirect: false,
      });

      if (!result?.error) {
        router.push("/");
      }
    } catch (error) {
      console.error("Erro no login demo:", error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: FileText,
      title: "Orçamentos Inteligentes",
      description: "Crie orçamentos profissionais em minutos com cálculos automáticos"
    },
    {
      icon: ShoppingCart,
      title: "Gestão de Vendas",
      description: "Converta orçamentos em vendas e acompanhe todo o processo"
    },
    {
      icon: BarChart3,
      title: "Relatórios Avançados",
      description: "Análises detalhadas com gráficos e métricas em tempo real"
    },
    {
      icon: Users,
      title: "Controle de Usuários",
      description: "Gerencie equipes com diferentes níveis de acesso"
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Dados protegidos com criptografia e backups automáticos"
    },
    {
      icon: Zap,
      title: "Performance",
      description: "Interface rápida e responsiva para máxima produtividade"
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      company: "Silva & Associados",
      text: "Reduziu em 80% o tempo para criar orçamentos. Excelente!",
      rating: 5
    },
    {
      name: "João Santos",
      company: "TechSolutions",
      text: "Os relatórios me ajudam a tomar decisões mais assertivas.",
      rating: 5
    },
    {
      name: "Ana Costa",
      company: "Design Studio",
      text: "Interface intuitiva e recursos poderosos. Recomendo!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white">
                <span className="text-sm font-bold">OPS</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Sistema</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#recursos" className="text-gray-600 hover:text-blue-600">Recursos</a>
              <a href="#precos" className="text-gray-600 hover:text-blue-600">Preços</a>
              <a href="#depoimentos" className="text-gray-600 hover:text-blue-600">Depoimentos</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Lado Esquerdo - Imagem */}
            <div className="relative">
              <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/business-dashboard.jpg"
                  alt="Dashboard de Gestão Empresarial"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent"></div>
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-semibold">+127% vendas</p>
                    <p className="text-xs text-gray-500">Este mês</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-semibold">15 orçamentos</p>
                    <p className="text-xs text-gray-500">Hoje</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lado Direito - Login e Informações */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Gerencie Orçamentos e Vendas com
                  <span className="text-blue-600"> Eficiência Total</span>
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  Sistema completo para controlar orçamentos, vendas, produtos e relatórios. 
                  Aumente sua produtividade em até 300%.
                </p>
              </div>

              {/* Login Card */}
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="text-center">Acesse sua Conta</CardTitle>
                  <CardDescription className="text-center">
                    Entre com suas credenciais ou teste gratuitamente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Sua senha"
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          className="pl-9 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>

                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Ou</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleTesteDemoLogin}
                      variant="outline" 
                      className="w-full mt-4"
                      disabled={loading}
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Teste Demo Gratuito
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Planos */}
              <div id="precos" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardHeader className="text-center">
                    <Badge className="w-fit mx-auto mb-2 bg-blue-100 text-blue-800">
                      Teste Gratuito
                    </Badge>
                    <CardTitle>30 Dias Grátis</CardTitle>
                    <CardDescription>Acesso completo sem compromisso</CardDescription>
                    <div className="text-3xl font-bold text-blue-600">R$ 0</div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Todos os recursos
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Até 100 orçamentos
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Relatórios básicos
                      </li>
                    </ul>
                    <Button 
                      onClick={handleTesteDemoLogin}
                      className="w-full mt-4" 
                      disabled={loading}
                    >
                      Começar Teste
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200 bg-green-50 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white">Mais Popular</Badge>
                  </div>
                  <CardHeader className="text-center">
                    <CardTitle>Plano Pro</CardTitle>
                    <CardDescription>Para empresas em crescimento</CardDescription>
                    <div className="text-3xl font-bold text-green-600">
                      R$ 29,90
                      <span className="text-lg font-normal text-gray-500">/mês</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Orçamentos ilimitados
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Relatórios avançados
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Múltiplos usuários
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Suporte prioritário
                      </li>
                    </ul>
                    <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                      Adquirir Plano Pro
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Recursos Poderosos para Sua Empresa
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tudo que você precisa para gerenciar orçamentos, vendas e relatórios em um só lugar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              O que Nossos Clientes Dizem
            </h2>
            <p className="text-xl text-gray-600">
              Empresas que já transformaram sua gestão com nosso sistema
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para Transformar sua Gestão?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a centenas de empresas que já otimizaram seus processos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleTesteDemoLogin}
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              disabled={loading}
            >
              <Zap className="mr-2 h-5 w-5" />
              Teste 30 Dias Grátis
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              Falar com Vendas
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
                  <span className="text-sm font-bold">OPS</span>
                </div>
                <span className="font-bold text-xl">Sistema</span>
              </div>
              <p className="text-gray-400">
                Solução completa para gestão de orçamentos e vendas.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#recursos" className="hover:text-white">Recursos</a></li>
                <li><a href="#precos" className="hover:text-white">Preços</a></li>
                <li><a href="#" className="hover:text-white">Atualizações</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Sobre</a></li>
                <li><a href="#" className="hover:text-white">Privacidade</a></li>
                <li><a href="#" className="hover:text-white">Termos</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 OPS Sistema. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

