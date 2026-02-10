import { useState, useEffect, useRef } from 'react';
import { Shield, LogOut, FileText, Users, AlertTriangle, Menu, X, Building2, ChevronDown, User, KeyRound, UserCog, Fish } from 'lucide-react';
import { Button } from './ui/button';
import { RegistreTraitements } from './RegistreTraitements';
import { ExerciceDroits } from './ExerciceDroits';
import { ViolationsDonnees } from './ViolationsDonnees';
import { UserProfile } from './UserProfile';
import { ClientUserManagement } from './ClientUserManagement';
import { PhishingDashboard } from './PhishingDashboard';
import { projectId } from '../utils/supabase/info';
import logoImage from 'figma:asset/8b41da225a8555c958a767da49b2bb7bdc17e6a6.png';

interface ClientDashboardProps {
  clientName: string;
  onLogout: () => void;
  userData?: any;
  accessToken?: string;
}

type Tab = 'registre' | 'droits' | 'violations' | 'profile' | 'users' | 'phishing';

export function ClientDashboard({ clientName, onLogout, userData, accessToken }: ClientDashboardProps) {
  const [legalEntities, setLegalEntities] = useState<any[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [showEntityDropdown, setShowEntityDropdown] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [loadingEntities, setLoadingEntities] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Debug: Log userData to console
  useEffect(() => {
    console.log('ClientDashboard userData:', userData);
    console.log('User role:', userData?.role);
    console.log('Is client_admin?', userData?.role === 'client_admin');
  }, [userData]);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-abb8d15d`;

  // Build tabs based on user permissions
  const allTabs = [
    { id: 'registre' as Tab, label: 'Registre des Traitements', icon: FileText, permission: 'registre' },
    { id: 'droits' as Tab, label: 'Exercices de Droits', icon: Users, permission: 'droits' },
    { id: 'violations' as Tab, label: 'Violations de Données', icon: AlertTriangle, permission: 'violations' },
    { id: 'phishing' as Tab, label: 'Tests de Phishing', icon: Fish, permission: 'phishing' },
    { id: 'profile' as Tab, label: 'Profil', icon: User, permission: 'profile' },
    { id: 'users' as Tab, label: 'Gestion des Utilisateurs', icon: UserCog, permission: 'users' },
  ];

  // Filter tabs based on user permissions
  const tabs = allTabs.filter(tab => {
    // Profile tab should not appear in main navigation
    if (tab.id === 'profile') {
      return false;
    }
    // If no userData or no permissions defined, show all tabs (backward compatibility)
    if (!userData || !userData.permissions) {
      return true;
    }
    // Check if user has permission for this tab
    return userData.permissions[tab.permission] === true;
  });

  // Set default active tab to the first available tab
  const getDefaultTab = (): Tab => {
    return tabs.length > 0 ? tabs[0].id : 'registre';
  };

  const [activeTab, setActiveTab] = useState<Tab>(getDefaultTab());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load user's legal entities
  useEffect(() => {
    const fetchLegalEntities = async () => {
      try {
        const response = await fetch(`${apiUrl}/user/legal-entities`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch legal entities: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Legal entities response:', data);
        console.log('Number of entities:', data.entities?.length);
        if (data.success && data.entities) {
          setLegalEntities(data.entities);
          // Select first entity by default
          if (data.entities.length > 0) {
            setSelectedEntityId(data.entities[0].id);
          }
        } else {
          console.error('No entities found or error:', data);
        }
      } catch (error) {
        console.error('Error fetching legal entities:', error);
      } finally {
        setLoadingEntities(false);
      }
    };

    if (accessToken) {
      fetchLegalEntities();
    }
  }, [accessToken]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowEntityDropdown(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedEntity = legalEntities.find(e => e.id === selectedEntityId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="Octopus Logo" className="h-10" />
            </div>
            
            <div className="flex items-center gap-3">
              {/* Entity Selector */}
              {!loadingEntities && legalEntities.length > 0 && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowEntityDropdown(!showEntityDropdown)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                  >
                    <Building2 className="h-4 w-4 text-gray-600" />
                    <span className="hidden sm:inline text-sm text-gray-700">
                      {selectedEntity?.name || 'Sélectionner une entité'}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${showEntityDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showEntityDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Entités juridiques</p>
                      </div>
                      {legalEntities.map((entity) => (
                        <button
                          key={entity.id}
                          onClick={() => {
                            setSelectedEntityId(entity.id);
                            setShowEntityDropdown(false);
                          }}
                          className={`w-full flex items-start gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${
                            selectedEntityId === entity.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <Building2 className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                            selectedEntityId === entity.id ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                          <div className="flex-1 text-left">
                            <p className={`text-sm ${
                              selectedEntityId === entity.id ? 'text-blue-600 font-medium' : 'text-gray-900'
                            }`}>
                              {entity.name}
                            </p>
                            {entity.siren && (
                              <p className="text-xs text-gray-500">SIREN: {entity.siren}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Account Menu */}
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="hidden sm:inline text-sm text-gray-700">
                    {userData?.name || 'Compte'}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showAccountMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Compte</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setShowAccountMenu(false);
                      }}
                      className={`w-full flex items-start gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${
                        activeTab === 'profile' ? 'bg-blue-50' : ''
                      }`}
                    >
                      <User className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                        activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div className="flex-1 text-left">
                        <p className={`text-sm ${
                          activeTab === 'profile' ? 'text-blue-600 font-medium' : 'text-gray-900'
                        }`}>
                          Mon Profil
                        </p>
                      </div>
                    </button>
                    {userData?.role === 'client_admin' && (
                      <button
                        onClick={() => {
                          setActiveTab('users');
                          setShowAccountMenu(false);
                        }}
                        className={`w-full flex items-start gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${
                          activeTab === 'users' ? 'bg-blue-50' : ''
                        }`}
                      >
                        <UserCog className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                          activeTab === 'users' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1 text-left">
                          <p className={`text-sm ${
                            activeTab === 'users' ? 'text-blue-600 font-medium' : 'text-gray-900'
                          }`}>
                            Mes Utilisateurs
                          </p>
                        </div>
                      </button>
                    )}
                    <button
                      onClick={onLogout}
                      className="w-full flex items-start gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                      <div className="flex-1 text-left">
                        <p className="text-sm text-gray-900">
                          Déconnexion
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop tabs */}
          <div className="hidden md:flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile tabs */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-between w-full py-4"
            >
              <div className="flex items-center gap-2">
                {activeTab === 'profile' ? (
                  <>
                    <User className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-900">Mon Profil</span>
                  </>
                ) : tabs.find(t => t.id === activeTab)?.icon ? (
                  <>
                    {(() => {
                      const Icon = tabs.find(t => t.id === activeTab)!.icon;
                      return <Icon className="h-5 w-5 text-blue-600" />;
                    })()}
                    <span className="text-gray-900">
                      {tabs.find(t => t.id === activeTab)?.label}
                    </span>
                  </>
                ) : null}
              </div>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {mobileMenuOpen && (
              <div className="pb-4 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 w-full px-4 py-3 rounded-lg ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingEntities ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : legalEntities.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <Building2 className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
            <h3 className="text-lg text-gray-900 mb-2">Aucune entité juridique</h3>
            <p className="text-gray-600">
              Vous n'avez pas encore accès à une entité juridique. Veuillez contacter votre administrateur.
            </p>
          </div>
        ) : !selectedEntityId ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg text-gray-900 mb-2">Sélectionnez une entité</h3>
            <p className="text-gray-600">
              Veuillez sélectionner une entité juridique pour accéder aux registres RGPD.
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'registre' && (
              <RegistreTraitements 
                userData={userData} 
                accessToken={accessToken} 
                entityId={selectedEntityId}
              />
            )}
            {activeTab === 'droits' && (
              <ExerciceDroits 
                userData={userData} 
                accessToken={accessToken}
                entityId={selectedEntityId}
              />
            )}
            {activeTab === 'violations' && (
              <ViolationsDonnees 
                userData={userData} 
                accessToken={accessToken}
                entityId={selectedEntityId}
              />
            )}
            {activeTab === 'profile' && (
              <UserProfile 
                userData={userData} 
                accessToken={accessToken}
              />
            )}
            {activeTab === 'users' && (
              <ClientUserManagement 
                userData={userData} 
                accessToken={accessToken}
                legalEntities={legalEntities}
              />
            )}
            {activeTab === 'phishing' && (
              <PhishingDashboard 
                userData={userData} 
                accessToken={accessToken}
                entityId={selectedEntityId}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}