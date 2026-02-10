import { Shield, Lock, FileCheck, Users, ChevronRight, Menu, X, GitBranch } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import logoImage from 'figma:asset/8b41da225a8555c958a767da49b2bb7bdc17e6a6.png';
import heroBackground from 'figma:asset/6015baa1ace825808d0aa92a5d51961d18029da4.png';

interface HomePageProps {
  onLoginClick: () => void;
  onSchemaClick?: () => void;
}

export function HomePage({ onLoginClick, onSchemaClick }: HomePageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src={logoImage} alt="Octopus Data & Privacy" className="h-10" />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-gray-600 hover:text-gray-900">Services</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900">À propos</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
              {onSchemaClick && (
                <button 
                  onClick={onSchemaClick}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <GitBranch className="size-4" />
                  Schéma Fonctionnel
                </button>
              )}
              <Button onClick={onLoginClick}>Espace Client</Button>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <a href="#services" className="block text-gray-600 hover:text-gray-900">Services</a>
              <a href="#about" className="block text-gray-600 hover:text-gray-900">À propos</a>
              <a href="#contact" className="block text-gray-600 hover:text-gray-900">Contact</a>
              <Button onClick={onLoginClick} className="w-full">Espace Client</Button>
              {onSchemaClick && <Button onClick={onSchemaClick} variant="outline" className="w-full">Schéma RGPD</Button>}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section 
        className="py-20 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        {/* Optional overlay for better text readability */}
        <div className="absolute inset-0 bg-white/40"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-8">
              <img src={logoImage} alt="Octopus Data & Privacy" className="h-20" />
            </div>
            <h1 className="text-gray-900 mb-6">
              Protégez vos données, sécurisez votre conformité RGPD
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Octopus Data & Privacy vous accompagne dans la protection des données personnelles 
              et la mise en conformité avec le Règlement Général sur la Protection des Données.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" onClick={onLoginClick}>
                Accéder à mon espace
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                Découvrir nos services
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-gray-900 mb-4">Nos Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une gamme complète de services pour votre conformité RGPD
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <div className="bg-blue-600 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <FileCheck className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-gray-900 mb-3">Registre des Traitements</h3>
              <p className="text-gray-600">
                Cartographie complète de vos traitements de données personnelles, 
                conforme aux exigences de l'article 30 du RGPD.
              </p>
            </div>

            <div className="bg-indigo-50 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <div className="bg-indigo-600 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-gray-900 mb-3">Gestion des Droits</h3>
              <p className="text-gray-600">
                Suivi et traitement des demandes d'exercice de droits : accès, rectification, 
                effacement, portabilité, opposition.
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-8 hover:shadow-lg transition-shadow">
              <div className="bg-purple-600 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-gray-900 mb-3">Violations de Données</h3>
              <p className="text-gray-600">
                Gestion et documentation des violations de données personnelles avec 
                notification CNIL dans les 72h.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-gray-900 mb-6">Votre partenaire de confiance</h2>
              <p className="text-gray-600 mb-4">
                Octopus Data & Privacy est spécialisé dans la protection des données personnelles 
                et l'accompagnement à la conformité RGPD.
              </p>
              <p className="text-gray-600 mb-4">
                Notre expertise vous permet de sécuriser vos processus, de réduire les risques 
                et de démontrer votre conformité aux autorités de contrôle.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-1 mt-1">
                    <ChevronRight className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Accompagnement personnalisé</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-1 mt-1">
                    <ChevronRight className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Expertise RGPD certifiée</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-1 mt-1">
                    <ChevronRight className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Outils digitaux performants</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg p-12 text-white">
              <Shield className="h-16 w-16 mb-6 opacity-90" />
              <h3 className="text-white mb-4">Portail Client Sécurisé</h3>
              <p className="text-blue-100 mb-6">
                Accédez à tout moment à vos documents de conformité : registre des traitements, 
                demandes d'exercice de droits et violations de données.
              </p>
              <Button variant="secondary" onClick={onLoginClick}>
                Se connecter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-gray-900 mb-6">Contactez-nous</h2>
            <p className="text-gray-600 mb-8">
              Notre équipe d'experts est à votre disposition pour répondre à vos questions 
              et vous accompagner dans votre démarche de conformité RGPD.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg">
                Demander un devis
              </Button>
              <Button size="lg" variant="outline">
                Prendre rendez-vous
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-blue-400" />
                <span className="text-white">Octopus Data & Privacy</span>
              </div>
              <p className="text-gray-400">
                Votre partenaire de confiance pour la protection des données personnelles 
                et la conformité RGPD.
              </p>
            </div>
            <div>
              <h4 className="text-white mb-4">Liens rapides</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#services" className="hover:text-white">Services</a></li>
                <li><a href="#about" className="hover:text-white">À propos</a></li>
                <li><a href="#contact" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Mentions légales</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>contact@octopus-data-privacy.fr</li>
                <li>+33 (0)1 23 45 67 89</li>
                <li>Paris, France</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Octopus Data & Privacy. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}