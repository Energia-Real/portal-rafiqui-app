'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Building2,
  Home,
  Send,
  CheckCircle,
  Loader2,
  AlertCircle,
  ChevronDown,
  Plus,
  Trash2,
  Package,
} from 'lucide-react';
import { collectionRequestsApi, CreateCollectionRequestDto, PanelEntry, solarPanelCatalogApi, SolarPanelModel, partnersApi, Partner } from '@/lib/api';

type PanelType = 'residential' | 'industrial';

interface ZipCodeResponse {
  id: number;
  d_codigo: string;
  d_asenta: string;
  d_tipo_asenta: string;
  d_mnpio: string;
  d_estado: string;
  d_ciudad: string;
}

interface PostalCodeData {
  colonias: string[];
  municipios: string[];
  estado: string;
}

interface PanelFormEntry {
  id: string;
  quantity: number;
  brand: string;
  model: string;
  catalogId: string;
  isCustom: boolean;
  customBrand: string;
  customModel: string;
}

interface FormData {
  street: string;
  exteriorNumber: string;
  interiorNumber: string;
  postalCode: string;
  colonia: string;
  municipio: string;
  estado: string;
  type: PanelType;
  contactName: string;
  contactPhone: string;
  notes: string;
}

const initialFormData: FormData = {
  street: '',
  exteriorNumber: '',
  interiorNumber: '',
  postalCode: '',
  colonia: '',
  municipio: '',
  estado: '',
  type: 'residential',
  contactName: '',
  contactPhone: '',
  notes: '',
};

const createEmptyPanelEntry = (): PanelFormEntry => ({
  id: crypto.randomUUID(),
  quantity: 1,
  brand: '',
  model: '',
  catalogId: '',
  isCustom: false,
  customBrand: '',
  customModel: '',
});

const fetchPostalCodeData = async (postalCode: string): Promise<PostalCodeData | null> => {
  try {
    const response = await fetch(`https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=${postalCode}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.zip_codes || data.zip_codes.length === 0) return null;
    
    const zipCodes: ZipCodeResponse[] = data.zip_codes;
    const colonias = [...new Set(zipCodes.map((zc) => zc.d_asenta))];
    const municipios = [...new Set(zipCodes.map((zc) => zc.d_mnpio))];
    const estado = zipCodes[0].d_estado;
    
    return {
      colonias,
      municipios,
      estado,
    };
  } catch {
    return null;
  }
};

export function CollectionRequestForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [panelEntries, setPanelEntries] = useState<PanelFormEntry[]>([createEmptyPanelEntry()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [requestId, setRequestId] = useState<string>('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [panelErrors, setPanelErrors] = useState<string>('');
  const [colonias, setColonias] = useState<string[]>([]);
  const [municipios, setMunicipios] = useState<string[]>([]);
  const [isLoadingPostalCode, setIsLoadingPostalCode] = useState(false);
  const [postalCodeError, setPostalCodeError] = useState<string>('');
  
  const [brands, setBrands] = useState<string[]>([]);
  const [modelsByBrand, setModelsByBrand] = useState<Record<string, SolarPanelModel[]>>({});
  const [loadingModels, setLoadingModels] = useState<Record<string, boolean>>({});
  
  const [isPartner, setIsPartner] = useState<boolean | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [wantsToBePartner, setWantsToBePartner] = useState<boolean | null>(null);
  const [isLoadingPartners, setIsLoadingPartners] = useState(false);

  const brandsLoadedRef = useRef(false);
  const loadingBrandsRef = useRef<Set<string>>(new Set());
  const partnersLoadedRef = useRef(false);

  useEffect(() => {
    if (brandsLoadedRef.current) return;
    brandsLoadedRef.current = true;
    solarPanelCatalogApi.getBrands().then((response) => {
      if (response.data) setBrands(response.data);
    });
  }, []);

  useEffect(() => {
    if (isPartner !== true || partnersLoadedRef.current) return;
    partnersLoadedRef.current = true;
    setIsLoadingPartners(true);
    partnersApi.getAll().then((response) => {
      if (response.data) setPartners(response.data.filter((p) => p.isActive));
      setIsLoadingPartners(false);
    });
  }, [isPartner]);

  const loadModelsForBrand = useCallback(async (brand: string) => {
    if (modelsByBrand[brand] || loadingBrandsRef.current.has(brand)) return;
    loadingBrandsRef.current.add(brand);
    setLoadingModels(prev => ({ ...prev, [brand]: true }));
    const response = await solarPanelCatalogApi.getModelsByBrand(brand);
    if (response.data) {
      setModelsByBrand(prev => ({ ...prev, [brand]: response.data! }));
    }
    setLoadingModels(prev => ({ ...prev, [brand]: false }));
    loadingBrandsRef.current.delete(brand);
  }, [modelsByBrand]);

  const addPanelEntry = () => {
    setPanelEntries(prev => [...prev, createEmptyPanelEntry()]);
    setPanelErrors('');
  };

  const removePanelEntry = (id: string) => {
    if (panelEntries.length > 1) {
      setPanelEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const updatePanelEntry = (id: string, field: keyof PanelFormEntry, value: string | number | boolean) => {
    setPanelEntries(prev => prev.map(entry => {
      if (entry.id !== id) return entry;
      
      const updated = { ...entry, [field]: value };
      
      if (field === 'brand') {
        updated.model = '';
        updated.catalogId = '';
        if (value && value !== 'OTHER') {
          loadModelsForBrand(value as string);
        }
      }
      
      if (field === 'model' && !entry.isCustom) {
        const models = modelsByBrand[entry.brand] || [];
        const selectedModel = models.find(m => m.model === value);
        updated.catalogId = selectedModel?.id || '';
      }
      
      if (field === 'isCustom') {
        updated.brand = '';
        updated.model = '';
        updated.catalogId = '';
        updated.customBrand = '';
        updated.customModel = '';
      }
      
      return updated;
    }));
    setPanelErrors('');
  };

  const handlePostalCodeSearch = useCallback(async (postalCode: string) => {
    if (postalCode.length !== 5) {
      setColonias([]);
      setMunicipios([]);
      setFormData(prev => ({ ...prev, colonia: '', municipio: '', estado: '' }));
      setPostalCodeError('');
      return;
    }

    setIsLoadingPostalCode(true);
    setPostalCodeError('');

    const data = await fetchPostalCodeData(postalCode);

    if (data) {
      setColonias(data.colonias);
      setMunicipios(data.municipios);
      setFormData(prev => ({
        ...prev,
        estado: data.estado,
        municipio: data.municipios.length === 1 ? data.municipios[0] : '',
        colonia: data.colonias.length === 1 ? data.colonias[0] : '',
      }));
      setErrors(prev => ({
        ...prev,
        estado: undefined,
        municipio: data.municipios.length === 1 ? undefined : prev.municipio,
        colonia: data.colonias.length === 1 ? undefined : prev.colonia,
        postalCode: undefined,
      }));
    } else {
      setColonias([]);
      setMunicipios([]);
      setFormData(prev => ({ ...prev, colonia: '', municipio: '', estado: '' }));
      setPostalCodeError('Código postal no encontrado');
    }

    setIsLoadingPostalCode(false);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.postalCode.length === 5) {
        handlePostalCodeSearch(formData.postalCode);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.postalCode, handlePostalCodeSearch]);

  const validatePanels = (): boolean => {
    for (const entry of panelEntries) {
      if (entry.quantity < 1) {
        setPanelErrors('La cantidad debe ser al menos 1');
        return false;
      }
      if (entry.isCustom) {
        if (!entry.customBrand.trim() || !entry.customModel.trim()) {
          setPanelErrors('Debes ingresar marca y modelo personalizados');
          return false;
        }
      } else {
        if (!entry.brand || !entry.model) {
          setPanelErrors('Selecciona marca y modelo para cada panel');
          return false;
        }
      }
    }
    setPanelErrors('');
    return true;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.street.trim()) {
      newErrors.street = 'La calle es requerida';
    }
    if (!formData.exteriorNumber.trim()) {
      newErrors.exteriorNumber = 'El número exterior es requerido';
    }
    if (!formData.postalCode.trim() || formData.postalCode.length !== 5) {
      newErrors.postalCode = 'El código postal debe tener 5 dígitos';
    }
    if (!formData.colonia.trim()) {
      newErrors.colonia = 'La colonia es requerida';
    }
    if (!formData.municipio.trim()) {
      newErrors.municipio = 'El municipio es requerido';
    }
    if (!formData.estado.trim()) {
      newErrors.estado = 'El estado es requerido';
    }
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'El nombre de contacto es requerido';
    }
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'El teléfono es requerido';
    }

    setErrors(newErrors);
    
    const panelsValid = validatePanels();
    
    return Object.keys(newErrors).length === 0 && panelsValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    const fullAddress = [
      formData.street,
      `#${formData.exteriorNumber}`,
      formData.interiorNumber ? `Int. ${formData.interiorNumber}` : '',
      formData.colonia,
      formData.municipio,
      formData.estado,
      `C.P. ${formData.postalCode}`,
    ].filter(Boolean).join(', ');

    const panels: PanelEntry[] = panelEntries.map(entry => ({
      quantity: entry.quantity,
      brand: entry.isCustom ? entry.customBrand : entry.brand,
      model: entry.isCustom ? entry.customModel : entry.model,
      catalogId: entry.catalogId || undefined,
      isCustom: entry.isCustom,
      customBrand: entry.isCustom ? entry.customBrand : undefined,
      customModel: entry.isCustom ? entry.customModel : undefined,
    }));

    const totalPanels = panelEntries.reduce((sum, entry) => sum + entry.quantity, 0);

    const requestData: CreateCollectionRequestDto = {
      pickupAddress: fullAddress,
      street: formData.street,
      exteriorNumber: formData.exteriorNumber,
      interiorNumber: formData.interiorNumber || undefined,
      colonia: formData.colonia,
      municipio: formData.municipio,
      estado: formData.estado,
      city: formData.municipio,
      postalCode: formData.postalCode,
      estimatedCount: totalPanels,
      panelType: formData.type,
      panels,
      partnerId: isPartner && selectedPartnerId ? selectedPartnerId : undefined,
      wantsToBePartner: !isPartner && wantsToBePartner === true ? true : undefined,
      contactName: formData.contactName,
      contactPhone: formData.contactPhone,
      notes: formData.notes || undefined,
    };

    const response = await collectionRequestsApi.create(requestData);

    if (response.error) {
      setSubmitStatus('error');
      setErrorMessage(response.error);
    } else if (response.data) {
      setSubmitStatus('success');
      setRequestId(response.data.id);
      setFormData(initialFormData);
    }

    setIsSubmitting(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'panelCount' ? parseInt(value) || 0 : value,
    }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (name: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const inputClass = (name: keyof FormData, extra = '') => {
    const hasError = errors[name];
    const isTouched = touched[name];
    const value = formData[name];
    if (hasError) return `input-field border-red-500 focus:border-red-500 focus:ring-red-500/30 ${extra}`;
    if (isTouched && value) return `input-field border-green-500/60 focus:border-green-500 focus:ring-green-500/20 ${extra}`;
    return `input-field ${extra}`;
  };

  if (submitStatus === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-500/20 mb-6"
        >
          <CheckCircle className="text-primary-400" size={40} />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">¡Solicitud Enviada!</h3>
        <p className="text-dark-400 mb-6 max-w-md mx-auto">
          Hemos recibido tu solicitud de recolección. Nuestro equipo se pondrá en contacto
          contigo en las próximas 24-48 horas.
        </p>
        <p className="text-sm text-dark-500 mb-6">
          Número de referencia: <span className="text-primary-400 font-mono">{requestId.slice(0, 8).toUpperCase()}</span>
        </p>
        <button
          onClick={() => setSubmitStatus('idle')}
          className="btn-outline"
        >
          Enviar otra solicitud
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-3">
          Tipo de Instalación
        </label>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: 'residential', label: 'Residencial', icon: <Home size={24} /> },
            { value: 'industrial', label: 'Industrial', icon: <Building2 size={24} /> },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, type: option.value as PanelType }))}
              className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                formData.type === option.value
                  ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                  : 'border-dark-600 text-dark-400 hover:border-dark-500'
              }`}
            >
              {option.icon}
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-6">
        {/* Street and Numbers */}
        <div className="grid md:grid-cols-6 gap-4">
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Calle
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                onBlur={() => handleBlur('street')}
                placeholder="Nombre de la calle"
                className={inputClass('street', 'pl-12')}
              />
            </div>
            {errors.street && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.street}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              No. Ext.
            </label>
            <input
              type="text"
              name="exteriorNumber"
              value={formData.exteriorNumber}
              onChange={handleChange}
              onBlur={() => handleBlur('exteriorNumber')}
              placeholder="123"
              className={inputClass('exteriorNumber')}
            />
            {errors.exteriorNumber && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.exteriorNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              No. Int.
            </label>
            <input
              type="text"
              name="interiorNumber"
              value={formData.interiorNumber}
              onChange={handleChange}
              placeholder="A"
              className="input-field"
            />
          </div>
        </div>

        {/* 1. Código Postal */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Código Postal
          </label>
          <div className="relative">
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="00000"
              maxLength={5}
              onBlur={() => handleBlur('postalCode')}
              className={inputClass('postalCode')}
            />
            {isLoadingPostalCode && (
              <span className="absolute right-4 inset-y-0 flex items-center pointer-events-none">
                <Loader2 className="text-primary-400 animate-spin" size={16} />
              </span>
            )}
          </div>
          {(errors.postalCode || postalCodeError) && (
            <p className="text-red-500 text-xs mt-1 ml-1">{errors.postalCode || postalCodeError}</p>
          )}
        </div>

        {/* 2. Estado (auto-filled) */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Estado
          </label>
          <input
            type="text"
            name="estado"
            value={formData.estado}
            readOnly
            placeholder="Se llenará automáticamente"
            className={`input-field bg-dark-700/50 cursor-not-allowed ${errors.estado ? 'border-red-500' : ''}`}
          />
          {errors.estado && (
            <p className="text-red-500 text-xs mt-1 ml-1">{errors.estado}</p>
          )}
        </div>

        {/* 3. Alcaldía / Municipio */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Alcaldía / Municipio
          </label>
          {municipios.length > 1 ? (
            <div className="relative">
              <select
                name="municipio"
                value={formData.municipio}
                onChange={handleChange}
                className={`input-field appearance-none pr-10 ${errors.municipio ? 'border-red-500 focus:border-red-500' : ''}`}
              >
                <option value="">Selecciona un municipio</option>
                {municipios.map((mun) => (
                  <option key={mun} value={mun}>
                    {mun}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" size={20} />
            </div>
          ) : (
            <input
              type="text"
              name="municipio"
              value={formData.municipio}
              readOnly
              placeholder="Se llenará automáticamente"
              className={`input-field bg-dark-700/50 cursor-not-allowed ${errors.municipio ? 'border-red-500' : ''}`}
            />
          )}
          {errors.municipio && (
            <p className="text-red-500 text-xs mt-1 ml-1">{errors.municipio}</p>
          )}
        </div>

        {/* 4. Colonia Select */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Colonia
          </label>
          <div className="relative">
            <select
              name="colonia"
              value={formData.colonia}
              onChange={handleChange}
              disabled={colonias.length === 0}
              className={`input-field appearance-none pr-10 ${errors.colonia ? 'border-red-500 focus:border-red-500' : ''} ${colonias.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">Selecciona una colonia</option>
              {colonias.map((colonia) => (
                <option key={colonia} value={colonia}>
                  {colonia}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" size={20} />
          </div>
          {errors.colonia && (
            <p className="text-red-500 text-xs mt-1 ml-1">{errors.colonia}</p>
          )}
        </div>
      </div>

      {/* Panel Entries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-dark-300">
            Paneles a Donar
          </label>
          <button
            type="button"
            onClick={addPanelEntry}
            className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            <Plus size={16} />
            Agregar Panel
          </button>
        </div>

        <AnimatePresence>
          {panelEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-dark-700/30 rounded-xl border border-dark-600 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-dark-300">
                  <Package size={18} />
                  <span className="font-medium">Panel {index + 1}</span>
                </div>
                {panelEntries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePanelEntry(entry.id)}
                    className="p-1 text-dark-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {/* Custom toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={entry.isCustom}
                  onChange={(e) => updatePanelEntry(entry.id, 'isCustom', e.target.checked)}
                  className="w-4 h-4 rounded border-dark-500 bg-dark-700 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-dark-400">Mi panel no está en el catálogo</span>
              </label>

              {entry.isCustom ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-dark-400 mb-1">Marca</label>
                    <input
                      type="text"
                      value={entry.customBrand}
                      onChange={(e) => updatePanelEntry(entry.id, 'customBrand', e.target.value)}
                      placeholder="Ej: SunPower"
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-dark-400 mb-1">Modelo</label>
                    <input
                      type="text"
                      value={entry.customModel}
                      onChange={(e) => updatePanelEntry(entry.id, 'customModel', e.target.value)}
                      placeholder="Ej: Maxeon 6"
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-dark-400 mb-1">Marca</label>
                    <div className="relative">
                      <select
                        value={entry.brand}
                        onChange={(e) => updatePanelEntry(entry.id, 'brand', e.target.value)}
                        className="input-field text-sm appearance-none pr-10"
                      >
                        <option value="">Selecciona marca</option>
                        {brands.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-dark-400 mb-1">Modelo</label>
                    <div className="relative">
                      <select
                        value={entry.model}
                        onChange={(e) => updatePanelEntry(entry.id, 'model', e.target.value)}
                        disabled={!entry.brand || loadingModels[entry.brand]}
                        className={`input-field text-sm appearance-none pr-10 ${!entry.brand ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value="">
                          {loadingModels[entry.brand] ? 'Cargando...' : 'Selecciona modelo'}
                        </option>
                        {(modelsByBrand[entry.brand] || []).map((model) => (
                          <option key={model.id} value={model.model}>
                            {model.model} ({model.powerWp}W)
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>
              )}

              <div className="w-32">
                <label className="block text-xs text-dark-400 mb-1">Cantidad</label>
                <input
                  type="number"
                  value={entry.quantity || ''}
                  onChange={(e) => updatePanelEntry(entry.id, 'quantity', e.target.value === '' ? 0 : parseInt(e.target.value))}
                  onBlur={(e) => {
                    if (!e.target.value || parseInt(e.target.value) < 1) {
                      updatePanelEntry(entry.id, 'quantity', 1);
                    }
                  }}
                  min="1"
                  className="input-field text-sm"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {panelErrors && (
          <p className="text-red-500 text-xs mt-1 ml-1">{panelErrors}</p>
        )}

        <div className="text-sm text-dark-400 text-right">
          Total: <span className="text-white font-medium">{panelEntries.reduce((sum, e) => sum + e.quantity, 0)} paneles</span>
        </div>
      </div>

      {/* Partner Section */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-dark-300">
          ¿Eres socio de Rafiqui?
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => {
              setIsPartner(true);
              setWantsToBePartner(null);
            }}
            className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 ${
              isPartner === true
                ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                : 'border-dark-600 text-dark-400 hover:border-dark-500'
            }`}
          >
            Sí, soy socio
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPartner(false);
              setSelectedPartnerId('');
            }}
            className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 ${
              isPartner === false
                ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                : 'border-dark-600 text-dark-400 hover:border-dark-500'
            }`}
          >
            No soy socio
          </button>
        </div>

        <AnimatePresence>
          {isPartner === true && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <label className="block text-sm text-dark-400">
                Selecciona tu empresa
              </label>
              <div className="relative">
                {isLoadingPartners ? (
                  <div className="flex items-center gap-2 text-dark-400 py-3">
                    <Loader2 className="animate-spin" size={18} />
                    <span className="text-sm">Cargando socios...</span>
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedPartnerId}
                      onChange={(e) => setSelectedPartnerId(e.target.value)}
                      className="input-field appearance-none pr-10"
                    >
                      <option value="">Selecciona un socio</option>
                      {partners.map((partner) => (
                        <option key={partner.id} value={partner.id}>
                          {partner.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" size={20} />
                  </>
                )}
              </div>
            </motion.div>
          )}

          {isPartner === false && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <label className="block text-sm text-dark-400">
                ¿Te gustaría ser socio de Rafiqui?
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setWantsToBePartner(true)}
                  className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 ${
                    wantsToBePartner === true
                      ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                      : 'border-dark-600 text-dark-400 hover:border-dark-500'
                  }`}
                >
                  Sí, me interesa
                </button>
                <button
                  type="button"
                  onClick={() => setWantsToBePartner(false)}
                  className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 ${
                    wantsToBePartner === false
                      ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                      : 'border-dark-600 text-dark-400 hover:border-dark-500'
                  }`}
                >
                  No por ahora
                </button>
              </div>

              {wantsToBePartner === true && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl"
                >
                  <p className="text-primary-400 text-sm">
                    ¡Excelente! Pronto nos pondremos en contacto contigo para darte más información sobre cómo ser socio de Rafiqui.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contact */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Nombre de Contacto
          </label>
          <input
            type="text"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            placeholder="Nombre completo"
            onBlur={() => handleBlur('contactName')}
            className={inputClass('contactName')}
          />
          {errors.contactName && (
            <p className="text-red-400 text-xs mt-1 ml-1">{errors.contactName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            onBlur={() => handleBlur('contactPhone')}
            placeholder="(00) 0000 0000"
            className={inputClass('contactPhone')}
          />
          {errors.contactPhone && (
            <p className="text-red-400 text-xs mt-1 ml-1">{errors.contactPhone}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-300 mb-2">
          Notas Adicionales (Opcional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="input-field resize-none"
          placeholder="Instrucciones de acceso, horarios preferidos, etc."
        />
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {submitStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400"
          >
            <AlertCircle size={20} />
            <p className="text-sm">{errorMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" size={24} />
            Enviando Solicitud...
          </>
        ) : (
          <>
            <Send size={24} />
            Solicitar Recolección
          </>
        )}
      </button>
    </form>
  );
}
