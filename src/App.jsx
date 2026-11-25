import { useCallback, useEffect, useRef, useState } from 'react';
import Places from './components/Places.jsx';
import { AVAILABLE_PLACES } from './data.js';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import { sortPlacesByDistance } from './loc.js';


  const allStorageDate = JSON.parse(localStorage.getItem("storedPlaces")) || []
  const readableSotrageData = allStorageDate.map((id) => AVAILABLE_PLACES.find((place) => place.id === id))

function App() {
  const selectedPlace = useRef();
  const [pickedPlaces, setPickedPlaces] = useState(readableSotrageData);
  const [AvailablePalaces, setAvalablePlaces] = useState([]);
  const [ modalIsOpen , setModalIsOpen ] = useState(false)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const userLocation = sortPlacesByDistance(
        AVAILABLE_PLACES,
        position.coords.latitude,
        position.coords.longitude
      );

      setAvalablePlaces(userLocation)
    })
  }, [])

  function handleStartRemovePlace(id) {
    setModalIsOpen(true)
    selectedPlace.current = id;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false)
  }

  function handleSelectPlace(id) {
    setPickedPlaces((prevPickedPlaces) => {
      if (prevPickedPlaces.some((place) => place.id === id)) {
        return prevPickedPlaces;
      }
      const place = AVAILABLE_PLACES.find((place) => place.id === id);
      return [place, ...prevPickedPlaces];
    });

    const localStored = JSON.parse(localStorage.getItem("storedPlaces")) || [];

    if (localStored.indexOf(id) === -1) {
      localStorage.setItem("storedPlaces", JSON.stringify([...localStored, id]))
    }

  }

  const handleRemovePlace = useCallback(function handleRemovePlace() {
    setPickedPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current)
    );

    const localStored = JSON.parse(localStorage.getItem("storedPlaces")) || [];
    localStorage.setItem("storedPlaces", JSON.stringify(localStored.filter((id) => id !== selectedPlace.current)))

    setModalIsOpen(false);
  } , [])



  return (
    <>
      <Modal open={modalIsOpen}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText={'Select the places you would like to visit below.'}
          places={pickedPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        <Places
          title="Available Places"
          fallbackText={"sorting places"}
          places={AvailablePalaces}
          onSelectPlace={handleSelectPlace}
        />
      </main>
    </>
  );
}

export default App;
