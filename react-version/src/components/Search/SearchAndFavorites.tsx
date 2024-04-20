import { ChangeEvent, useEffect, useRef, useState } from 'react';
import styles from './SearchAndFavorites.module.css';

function SearchAndFavorites() {
    const cancelSearchButton = useRef<HTMLButtonElement>(null);
    const searchInput = useRef<HTMLInputElement>(null);

    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        if (searchQuery === '') {
                cancelSearchButton.current!.hidden = true;
        } else if (searchQuery !== '') {
                cancelSearchButton.current!.hidden = false;
        }
    }, [searchQuery]);

    const updateSearchQuery = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const clearSearchQuery = () => {
        setSearchQuery('');
        searchInput.current!.value = '';
    };



    return <>
        <div className={styles['search']}>
            <div className={styles['wrapper']}>
                <img className={styles['search-icon']} src="/src/assets/search-icon.svg"></img>
                <input ref={searchInput} onChange={updateSearchQuery} type="text" className={styles['input']} placeholder="Search crypto"></input>
                <button onClick={clearSearchQuery} ref={cancelSearchButton} className={styles['cancel-search-button']} hidden><img src="/src/assets/cancel-search.svg"/></button>
            </div>
        </div>
    </>;
}

export default SearchAndFavorites;