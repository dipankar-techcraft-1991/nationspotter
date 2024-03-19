import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import CountryDetailShimmer from "./CountryDetailShimmer";
import "./CountryDetail.css";

export default function CountryDetail() {
  const [isDark] = useTheme();
  const params = useParams();
  const { state } = useLocation();
  const countryName = params.country;

  const [countryData, setCountryData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  function updateCountryData(data) {
    setCountryData({
      name: data.name.common || data.name,
      nativeName: Object.values(data.name.nativeName || {})[0]?.common,
      population: !data.population
        ? "No Population"
        : data.population.toLocaleString("en-IN"),
      region: !data.region ? "No Region" : data.region,
      subregion: !data.subregion ? "No Subregion" : data.subregion,
      capital: !data.capital ? "No Capital" : data.capital.join(", "),
      flag: !data.flags.svg ? null : data.flags.svg,
      tld: !data.tld ? "No Top Level Domain" : data.tld.join(", "),
      languages: !data.languages
        ? "No Languages"
        : Object.values(data.languages || {}).join(", "),
      currencies: !data.currencies
        ? "No Currencies"
        : Object.values(data.currencies || {})
            .map((currency) => currency.name)
            .join(", "),
      borders: [],
    });

    if (!data.borders) {
      data.borders = [];
    }

    Promise.all(
      data.borders.map((border) => {
        return fetch(`https://restcountries.com/v3.1/alpha/${border}`)
          .then((res) => res.json())
          .then(([borderCountry]) => borderCountry.name.common);
      })
    ).then((borders) => {
      setTimeout(() =>
        setCountryData((prevState) => ({ ...prevState, borders }))
      );
    });
  }

  useEffect(() => {
    if (state) {
      updateCountryData(state);
      return;
    }

    fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`)
      .then((res) => res.json())
      .then(([data]) => {
        updateCountryData(data);
      })
      .catch((err) => {
        setNotFound(true);
      });
  }, [countryName]);

  if (notFound) {
    return (
      <>
        <p className="not-found">Country Not Found</p>
        <Link to="/" className="not-found-home">
          Home
        </Link>
      </>
    );
  }

  return (
    <main className={`${isDark ? "dark" : ""}`}>
      <div className="country-details-container">
        <span className="back-button" onClick={() => history.back()}>
          <i className="fa-solid fa-arrow-left"></i>&nbsp; Back
        </span>
        {countryData === null ? (
          <CountryDetailShimmer />
        ) : (
          <div className="country-details">
            <img src={countryData.flag} alt={`${countryData.name} flag`} />
            <div className="details-text-container">
              <h1>{countryData.name}</h1>
              <div className="details-text">
                <p>
                  <b>Native Name : </b>
                  {countryData.nativeName || countryData.name}
                  <span className="native-name"></span>
                </p>
                <p>
                  <b>Population : </b>
                  {countryData.population}
                  <span className="population"></span>
                </p>
                <p>
                  <b>Region : </b>
                  {countryData.region}
                  <span className="region"></span>
                </p>
                <p>
                  <b>Sub Region : </b>
                  {countryData.subregion}
                  <span className="sub-region"></span>
                </p>
                <p>
                  <b>Capital : </b>
                  {countryData.capital}
                  <span className="capital"></span>
                </p>
                <p>
                  <b>Top Level Domain : </b>
                  {countryData.tld}
                  <span className="top-level-domain"></span>
                </p>
                <p>
                  <b>Currencies : </b>
                  {countryData.currencies}
                  <span className="currencies"></span>
                </p>
                <p>
                  <b>Languages : </b>
                  {countryData.languages}
                  <span className="languages"></span>
                </p>
              </div>
              {countryData.borders.length !== 0 && (
                <div className="border-countries">
                  <b>Border Countries: </b>&nbsp;
                  {countryData.borders.map((border) => (
                    <Link key={border} to={`/${border}`}>
                      {border}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
