import { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import Photo from "./Photo";
import axios from "axios";
import Loading from "./Loading";
import { nanoid } from "nanoid";

const clientID = `?client_id=${import.meta.env.VITE_ACCESS_KEY}`;
const mainUrl = `https://api.unsplash.com/photos/`;
const searchUrl = `https://api.unsplash.com/search/photos/`;

export default function App() {
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [newImages, setNewImages] = useState(false);
  const mounted = useRef(false);

  const fetchImages = async () => {
    setLoading(true);
    let url;
    const urlPage = `&page=${page}`;
    const urlQuery = `&query=${query}`;

    if (query) {
      url = `${searchUrl}${clientID}${urlPage}${urlQuery}`;
    } else {
      url = `${mainUrl}${clientID}${urlPage}`;
    }

    try {
      const { data } = await axios.get(url);
      setPhotos((prevPhotos) => {
        if (query && page === 1) {
          return data.results;
        } else if (query) {
          return [...prevPhotos, ...data.results];
        } else {
          return [...prevPhotos, ...data];
        }
      });
      setNewImages(false);
      setLoading(false);
    } catch (error) {
      setNewImages(false);
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [page]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (!newImages) return
    if (loading) return
    setPage(prevPage => prevPage + 1)
  }, [newImages]);

  const event = () => {
    const innerHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const scrollHeight = document.body.scrollHeight - 10;

    if (innerHeight + scrollY >= scrollHeight) {
      setNewImages(true);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", event);

    return () => window.removeEventListener("scroll", event);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!query) return;
    if (page === 1) {
      fetchImages();
      return;
    }
    setPage(1);
  }

  function handleChange(e) {
    setQuery(e.target.value);
  }

  return (
    <main>
      <section className="search">
        <form className="search-form">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="search"
            className="form-input"
          />
          <button type="submit" className="submit-btn" onClick={handleSubmit}>
            <FaSearch />
          </button>
        </form>
      </section>

      <section className="photos">
        <div className="photos-center">
          {photos.map((img) => {
            // I use nanoid() because some photos are repeated and "img.id" matches and gives errors
            return <Photo key={nanoid()} {...img} />;
          })}
        </div>
        {loading && <Loading center="center" />}
      </section>
    </main>
  );
}
