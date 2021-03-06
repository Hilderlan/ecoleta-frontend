import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet';
import logo from '../../assets/logo.svg';
import api from '../../services/api';
import axios from 'axios';
import './styles.css';

const CreatePoint = () => {
  const [itens, setItens] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  });

  const [ufs, setUfs] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedItems, setSelectedItems] = useState([]);

  const [selectedPosition, setSelectedPosition] = useState([0, 0]);
  // const [initialPosition, setInitialPosition] = useState([]);

  const history = useHistory();

  useEffect(() =>{
    api.get('items').then(response => {
      setItens(response.data);
    })
  }, []);

  useEffect(() => {
    axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => {
        const ufInitials = response.data.map(uf => uf.sigla);
        setUfs(ufInitials);
      });
  }, []);

  useEffect(() => {
    if(selectedUf === '0'){
      return;
    }
    
    axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then(response => {
        const cityNames = response.data.map(city => city.nome);

        setCities(cityNames);
      });
  }, [selectedUf]);

  // useEffect(() => {
  //   navigator.geolocation.getCurrentPosition(position => {
  //     const { latitude, longitude } = position.coords;
  //     setInitialPosition(latitude, longitude);
  //   });
  // }, []);

  function handleSelectUf(e){
    const uf = e.target.value;
    
    setSelectedUf(uf);
  }

  function handleSelectCity(e){
    const city = e.target.value;

    setSelectedCity(city);
  }

  function handleMapClick(e){    
    const { lat, lng } = e.latlng;
    setSelectedPosition([lat, lng])
  }

  function handleFormData(e) {
    const { name, value } = e.target;

    setFormData({...formData, [name]:value });
  }

  function handleItemClick(id) {
    const alreadyInclude = selectedItems.findIndex(item => item === id);

    if(alreadyInclude >= 0) {
      const itemsFiltered = selectedItems.filter(item => item !== id);

      setSelectedItems(itemsFiltered);
    }
    else {
      setSelectedItems([...selectedItems, id ]);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items
    }

    api.post('points', data)
    history.push('/');
  }

  return(
    <div id="page-create-point">
      <header>
        <img src={ logo } alt="Ecoleta"/>

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={ handleSubmit }>
        <h1>Cadastro do <br /> ponto de coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input type="text" name="name" id="name" value={ formData.name } onChange={ handleFormData } />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input type="email" name="email" id="email" value={ formData.email } onChange={ handleFormData } />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input type="text" name="whatsapp" id="whatsapp" value={ formData.whatsapp } onChange={ handleFormData } />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={[-5.0328144, -42.8150323]} zoom={15} onClick={ handleMapClick }>
            <TileLayer attribution="&amp;copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select onChange={handleSelectUf} value={selectedUf} name="uf" id="uf">
                <option value="0">Selecione uma UF</option>
                { ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                )) }
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select onChange={handleSelectCity} value={selectedCity} name="city" id="city">
                <option value="0">Selecione uma cidade</option>
                { cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                )) }
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            { itens.map(item => (
              <li key={item.id} onClick={ () => handleItemClick(item.id) } className={ selectedItems.includes(item.id) ? 'selected' : '' } >
                <img src={ item.image_url } alt= { item.title } />
                <span> { item.title } </span>
              </li>
            )) }
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
}

export default CreatePoint;