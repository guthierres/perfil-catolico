import { Cross, Users, Share2, Sparkles, CheckCircle, ArrowRight, Music, Palette } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full mb-6 shadow-2xl">
            <Cross className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
            Carteirinha Católica Digital
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Compartilhe sua fé de forma moderna e personalizada. Crie sua identidade católica digital em minutos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-xl mb-3">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Identidade Católica</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Crie um perfil completo com suas informações religiosas, paróquia, múltiplas pastorais e santo de devoção.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-xl mb-3">
              <Share2 className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Compartilhe Facilmente</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Tenha um link personalizado único para compartilhar no Instagram, WhatsApp e redes sociais.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-xl mb-3">
              <Palette className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Totalmente Personalizável</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Escolha cores, gradientes, imagens de fundo e crie uma carteirinha com sua personalidade.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-xl mb-3">
              <Music className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Músicas Incorporadas</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Adicione suas músicas católicas favoritas do Spotify ou YouTube direto no seu perfil.
            </p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Por que ter uma carteirinha católica?
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Testemunhe sua fé</h4>
                <p className="text-gray-600">
                  Uma forma moderna e acessível de compartilhar sua identidade católica com amigos, família e comunidade.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Conecte-se com outros católicos</h4>
                <p className="text-gray-600">
                  Mostre sua paróquia, múltiplas pastorais e crie conexões com outros membros da comunidade católica.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Compartilhe músicas católicas</h4>
                <p className="text-gray-600">
                  Adicione suas músicas e hinos católicos favoritos do Spotify ou YouTube para inspirar outros fiéis.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Inspire através da Palavra</h4>
                <p className="text-gray-600">
                  Compartilhe suas passagens bíblicas favoritas e frases inspiradoras que guiam sua caminhada espiritual.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Link único para redes sociais</h4>
                <p className="text-gray-600">
                  Adicione seu link personalizado na bio do Instagram, perfil do WhatsApp e outras redes para que todos possam conhecer sua fé.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">100% Gratuito</h4>
                <p className="text-gray-600">
                  Crie e personalize sua carteirinha católica gratuitamente. Sem custos ocultos, sempre grátis.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-12 py-5 rounded-xl font-bold text-lg hover:from-amber-700 hover:to-orange-700 transition shadow-2xl hover:shadow-3xl transform hover:scale-105"
          >
            Criar Minha Carteirinha
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="text-gray-600 mt-4">É grátis e leva menos de 5 minutos</p>
        </div>
      </div>
    </div>
  );
}
