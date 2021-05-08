import {FunctionalComponent, h} from 'preact';
import style from './style.css';
import {useEffect, useState} from "preact/hooks";
import axios from "axios";

const Home: FunctionalComponent = () => {
	const [data, setData] = useState('');

	useEffect( () => {
		fetchData();
	}, []);

	const fetchData = async () => {
		const res = await axios.get('/api/list');
		setData(res.data);
	};

	return (
		<div class={style.home}>
			<h1>Home</h1>
			<pre>{data.time}</pre>
		</div>
	);
};

export default Home;
