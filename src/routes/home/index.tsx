import {FunctionalComponent, h} from 'preact';
import style from './style.css';
import {useEffect, useState} from "preact/hooks";
import axios from "axios";

const isNetlify = () => document.location.host.includes('netlify');

const api = (endpoint: string) => isNetlify() ? '/.netlify/functions/' + endpoint:
	'/api/' + endpoint;

const Home: FunctionalComponent = () => {

	return (
		<div class={style.home}>
			<h1>Bikes</h1>
			<Page page={1}/>
			<Page page={2}/>
			<Page page={3}/>
		</div>
	);
};

function Page(props: { page: number }) {
	const [data, setData] = useState<{ searchURL: string, links: string[] }>({searchURL: 'loading...', links: []});

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		const res = await axios.get(api('list?page=' + props.page));
		setData(res.data);
	};
	return <div>
		<hr/>
		<div>
			<a href={data.searchURL}>{data.searchURL}</a>
		</div>
		<div>
			{data.links.map(href => <OneBike href={href}/>)}</div>
	</div>
}

function OneBike(props: { href: string }) {
	const [data, setData] = useState<any>({});

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		const res = await axios.get(api('details?url=' + props.href));
		setData(res.data);
	};

	let isBosch = (data?.title && data?.title.includes('Bosch')) ||
		(data?.sDescription && data?.sDescription.includes('Bosch'));

	return data && <div style={{background: isBosch ? '#ff77ff' : '#77ffff', padding: '1em', margin: '1em 0'}}>
		<div style={{display: 'flex', justifyContent: 'space-between'}}>
			<h4><a href={data.detailURL} target={data.detailURL}>{data.title}</a></h4>
			<div>{data.price}</div>
		</div>
		<div className="clearfix">
			<img src={data.image} style={{float: "right", margin: '1em'}} width="350"/>
			<div>Since: {data.since}</div>
			<div>Years: {(data.years || []).join(', ')}</div>
			<div>Locality: {data.locality}</div>
			<div>isBosch: {isBosch ? 'BOSCH' : '-'}</div>
			<div>{(data.description || []).map((p: string) => <p>{p}</p>)}</div>
		</div>
		{/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
	</div>
}

export default Home;
