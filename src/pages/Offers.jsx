import { useState } from 'react';
import { useEffect } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import ListingItem from '../components/ListingItem';

function Offers() {

  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState(null)


  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingsRef = collection(db, 'listings');
        const q = query(
          listingsRef,
          where('offer', '==', true),
          orderBy('timestamp', 'desc'),
          limit(10)
        );

        const querySnap = await getDocs(q);

        const lastVisible = querySnap.docs[querySnap.docs.length - 1]

        setLastFetchedListing(lastVisible)


        let listings = [];

        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setListings(listings);
        setLoading(false);
      } catch (error) {
        toast.error('Impossible de charger les annonces');
      }
    };

    fetchListings();
  }, []);

  // Pagination / Load more
  const onFetchMoreListings = async () => {
    try {
      const listingsRef = collection(db, 'listings');
      const q = query(
        listingsRef,
        where('offer', '==', true),
        orderBy('timestamp', 'desc'),
        limit(10),
        startAfter(lastFetchedListing)
      );

      const querySnap = await getDocs(q);
      
      const lastVisible = querySnap.docs[querySnap.docs.length - 1]

      setLastFetchedListing(lastVisible)

      let listings = [];

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setListings((prev) => [...prev, ...listings]);
      setLoading(false);
    } catch (error) {
      toast.error('Impossible de charger les annonces');
    }
  };

  return (
    <div className='category'>
      <header>
        <p className='pageHeader'>
          Offres
        </p>
      </header>
      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
        <main>
          <ul className="categoryListings">
            {listings.map((listing) => (
             <ListingItem listing={listing.data}  id={listing.id} key={listing.id}/>
            ))}
          </ul>
        </main>
        <br />
        <br />
        {lastFetchedListing && (
          <p className="loadMore" onClick={onFetchMoreListings}>Plus d'annonces</p>
        )}
        </>
      ) : (
        <p>Aucune offres</p>
      )}
    </div>
  );
}

export default Offers;
