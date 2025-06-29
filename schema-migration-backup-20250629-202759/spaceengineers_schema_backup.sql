--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.5 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: spaceengineers; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA spaceengineers;


--
-- Name: currencies_type_enum; Type: TYPE; Schema: spaceengineers; Owner: -
--

CREATE TYPE spaceengineers.currencies_type_enum AS ENUM (
    'GLOBAL',
    'GAME_SPECIFIC'
);


--
-- Name: wallet_transactions_status_enum; Type: TYPE; Schema: spaceengineers; Owner: -
--

CREATE TYPE spaceengineers.wallet_transactions_status_enum AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
);


--
-- Name: wallet_transactions_transaction_type_enum; Type: TYPE; Schema: spaceengineers; Owner: -
--

CREATE TYPE spaceengineers.wallet_transactions_transaction_type_enum AS ENUM (
    'DEPOSIT',
    'WITHDRAW',
    'TRANSFER_IN',
    'TRANSFER_OUT',
    'PURCHASE',
    'SALE',
    'REWARD',
    'PENALTY'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: currencies; Type: TABLE; Schema: spaceengineers; Owner: -
--

CREATE TABLE spaceengineers.currencies (
    id bigint NOT NULL,
    code character varying(10),
    name character varying(50),
    symbol character varying(5),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    game_id integer,
    type spaceengineers.currencies_type_enum DEFAULT 'GAME_SPECIFIC'::spaceengineers.currencies_type_enum NOT NULL,
    decimal_places integer DEFAULT 2 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    metadata json
);


--
-- Name: currencies_id_seq; Type: SEQUENCE; Schema: spaceengineers; Owner: -
--

CREATE SEQUENCE spaceengineers.currencies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: currencies_id_seq; Type: SEQUENCE OWNED BY; Schema: spaceengineers; Owner: -
--

ALTER SEQUENCE spaceengineers.currencies_id_seq OWNED BY spaceengineers.currencies.id;


--
-- Name: game_servers; Type: TABLE; Schema: spaceengineers; Owner: -
--

CREATE TABLE spaceengineers.game_servers (
    id integer NOT NULL,
    game_id integer NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(500),
    server_url character varying(255),
    port integer,
    is_active boolean DEFAULT true NOT NULL,
    metadata json,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: game_servers_id_seq; Type: SEQUENCE; Schema: spaceengineers; Owner: -
--

CREATE SEQUENCE spaceengineers.game_servers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: game_servers_id_seq; Type: SEQUENCE OWNED BY; Schema: spaceengineers; Owner: -
--

ALTER SEQUENCE spaceengineers.game_servers_id_seq OWNED BY spaceengineers.game_servers.id;


--
-- Name: games; Type: TABLE; Schema: spaceengineers; Owner: -
--

CREATE TABLE spaceengineers.games (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(500),
    icon_url character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: games_id_seq; Type: SEQUENCE; Schema: spaceengineers; Owner: -
--

CREATE SEQUENCE spaceengineers.games_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: games_id_seq; Type: SEQUENCE OWNED BY; Schema: spaceengineers; Owner: -
--

ALTER SEQUENCE spaceengineers.games_id_seq OWNED BY spaceengineers.games.id;


--
-- Name: item_download_log; Type: TABLE; Schema: spaceengineers; Owner: -
--

CREATE TABLE spaceengineers.item_download_log (
    id integer NOT NULL,
    storage_id integer NOT NULL,
    item_id integer NOT NULL,
    quantity integer NOT NULL,
    status text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: item_download_log_id_seq; Type: SEQUENCE; Schema: spaceengineers; Owner: -
--

CREATE SEQUENCE spaceengineers.item_download_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: item_download_log_id_seq; Type: SEQUENCE OWNED BY; Schema: spaceengineers; Owner: -
--

ALTER SEQUENCE spaceengineers.item_download_log_id_seq OWNED BY spaceengineers.item_download_log.id;


--
-- Name: items; Type: TABLE; Schema: spaceengineers; Owner: -
--

CREATE TABLE spaceengineers.items (
    id bigint NOT NULL,
    display_name character varying NOT NULL,
    rarity integer NOT NULL,
    description text,
    category character varying(10),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    icons json NOT NULL,
    index_name character varying NOT NULL
);


--
-- Name: items_id_seq; Type: SEQUENCE; Schema: spaceengineers; Owner: -
--

CREATE SEQUENCE spaceengineers.items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: spaceengineers; Owner: -
--

ALTER SEQUENCE spaceengineers.items_id_seq OWNED BY spaceengineers.items.id;


--
-- Name: marketplace_items; Type: TABLE; Schema: spaceengineers; Owner: -
--

CREATE TABLE spaceengineers.marketplace_items (
    id bigint NOT NULL,
    seller_steam_id character varying NOT NULL,
    item_name character varying NOT NULL,
    price integer NOT NULL,
    quantity integer NOT NULL,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: marketplace_items_id_seq; Type: SEQUENCE; Schema: spaceengineers; Owner: -
--

CREATE SEQUENCE spaceengineers.marketplace_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: marketplace_items_id_seq; Type: SEQUENCE OWNED BY; Schema: spaceengineers; Owner: -
--

ALTER SEQUENCE spaceengineers.marketplace_items_id_seq OWNED BY spaceengineers.marketplace_items.id;


--
-- Name: migrations; Type: TABLE; Schema: spaceengineers; Owner: -
--

CREATE TABLE spaceengineers.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: spaceengineers; Owner: -
--

CREATE SEQUENCE spaceengineers.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: spaceengineers; Owner: -
--

ALTER SEQUENCE spaceengineers.migrations_id_seq OWNED BY spaceengineers.migrations.id;


--
-- Name: online_storage; Type: TABLE; Schema: spaceengineers; Owner: -
--

CREATE TABLE spaceengineers.online_storage (
    id bigint NOT NULL,
    steam_id character varying NOT NULL
);


--
-- Name: online_storage_id_seq; Type: SEQUENCE; Schema: spaceengineers; Owner: -
--

CREATE SEQUENCE spaceengineers.online_storage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: online_storage_id_seq; Type: SEQUENCE OWNED BY; Schema: spaceengineers; Owner: -
--

ALTER SEQUENCE spaceengineers.online_storage_id_seq OWNED BY spaceengineers.online_storage.id;


--
-- Name: online_storage_items; Type: TABLE; Schema: spaceengineers; Owner: -
--

CREATE TABLE spaceengineers.online_storage_items (
    id bigint NOT NULL,
    storage_id bigint NOT NULL,
    item_id bigint NOT NULL,
    quantity integer NOT NULL
);


--
-- Name: online_storage_items_id_seq; Type: SEQUENCE; Schema: spaceengineers; Owner: -
--

CREATE SEQUENCE spaceengineers.online_storage_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: online_storage_items_id_seq; Type: SEQUENCE OWNED BY; Schema: spaceengineers; Owner: -
--

ALTER SEQUENCE spaceengineers.online_storage_items_id_seq OWNED BY spaceengineers.online_storage_items.id;


--
-- Name: users; Type: TABLE; Schema: spaceengineers; Owner: -
--

CREATE TABLE spaceengineers.users (
    id bigint NOT NULL,
    username character varying NOT NULL,
    email character varying,
    password character varying,
    steam_id character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    score double precision DEFAULT 0 NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: spaceengineers; Owner: -
--

CREATE SEQUENCE spaceengineers.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: spaceengineers; Owner: -
--

ALTER SEQUENCE spaceengineers.users_id_seq OWNED BY spaceengineers.users.id;


--
-- Name: wallet_transactions; Type: TABLE; Schema: spaceengineers; Owner: -
--

CREATE TABLE spaceengineers.wallet_transactions (
    id bigint NOT NULL,
    wallet_id bigint NOT NULL,
    user_id integer NOT NULL,
    transaction_type spaceengineers.wallet_transactions_transaction_type_enum NOT NULL,
    amount numeric(20,8) NOT NULL,
    balance_before numeric(20,8) NOT NULL,
    balance_after numeric(20,8) NOT NULL,
    description character varying(500),
    reference_id character varying(100),
    status spaceengineers.wallet_transactions_status_enum DEFAULT 'COMPLETED'::spaceengineers.wallet_transactions_status_enum NOT NULL,
    metadata json,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: wallet_transactions_id_seq; Type: SEQUENCE; Schema: spaceengineers; Owner: -
--

CREATE SEQUENCE spaceengineers.wallet_transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: wallet_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: spaceengineers; Owner: -
--

ALTER SEQUENCE spaceengineers.wallet_transactions_id_seq OWNED BY spaceengineers.wallet_transactions.id;


--
-- Name: wallets; Type: TABLE; Schema: spaceengineers; Owner: -
--

CREATE TABLE spaceengineers.wallets (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    game_id integer NOT NULL,
    server_id integer,
    currency_id integer NOT NULL,
    balance numeric(20,8) DEFAULT 0 NOT NULL,
    locked_balance numeric(20,8) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    metadata json,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: wallets_backup_1751195740620; Type: TABLE; Schema: spaceengineers; Owner: -
--

CREATE TABLE spaceengineers.wallets_backup_1751195740620 (
    id bigint,
    user_id integer,
    balance numeric(10,2),
    currency_id integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: wallets_id_seq; Type: SEQUENCE; Schema: spaceengineers; Owner: -
--

CREATE SEQUENCE spaceengineers.wallets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: wallets_id_seq; Type: SEQUENCE OWNED BY; Schema: spaceengineers; Owner: -
--

ALTER SEQUENCE spaceengineers.wallets_id_seq OWNED BY spaceengineers.wallets.id;


--
-- Name: currencies id; Type: DEFAULT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.currencies ALTER COLUMN id SET DEFAULT nextval('spaceengineers.currencies_id_seq'::regclass);


--
-- Name: game_servers id; Type: DEFAULT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.game_servers ALTER COLUMN id SET DEFAULT nextval('spaceengineers.game_servers_id_seq'::regclass);


--
-- Name: games id; Type: DEFAULT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.games ALTER COLUMN id SET DEFAULT nextval('spaceengineers.games_id_seq'::regclass);


--
-- Name: item_download_log id; Type: DEFAULT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.item_download_log ALTER COLUMN id SET DEFAULT nextval('spaceengineers.item_download_log_id_seq'::regclass);


--
-- Name: items id; Type: DEFAULT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.items ALTER COLUMN id SET DEFAULT nextval('spaceengineers.items_id_seq'::regclass);


--
-- Name: marketplace_items id; Type: DEFAULT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.marketplace_items ALTER COLUMN id SET DEFAULT nextval('spaceengineers.marketplace_items_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.migrations ALTER COLUMN id SET DEFAULT nextval('spaceengineers.migrations_id_seq'::regclass);


--
-- Name: online_storage id; Type: DEFAULT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.online_storage ALTER COLUMN id SET DEFAULT nextval('spaceengineers.online_storage_id_seq'::regclass);


--
-- Name: online_storage_items id; Type: DEFAULT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.online_storage_items ALTER COLUMN id SET DEFAULT nextval('spaceengineers.online_storage_items_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.users ALTER COLUMN id SET DEFAULT nextval('spaceengineers.users_id_seq'::regclass);


--
-- Name: wallet_transactions id; Type: DEFAULT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.wallet_transactions ALTER COLUMN id SET DEFAULT nextval('spaceengineers.wallet_transactions_id_seq'::regclass);


--
-- Name: wallets id; Type: DEFAULT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.wallets ALTER COLUMN id SET DEFAULT nextval('spaceengineers.wallets_id_seq'::regclass);


--
-- Data for Name: currencies; Type: TABLE DATA; Schema: spaceengineers; Owner: -
--

COPY spaceengineers.currencies (id, code, name, symbol, created_at, updated_at, game_id, type, decimal_places, is_active, metadata) FROM stdin;
12	USD	US Dollar	$	2025-06-29 11:15:40.340775	2025-06-29 11:15:40.340775	\N	GLOBAL	2	t	\N
13	EUR	Euro	€	2025-06-29 11:15:40.340775	2025-06-29 11:15:40.340775	\N	GLOBAL	2	t	\N
14	KRW	Korean Won	₩	2025-06-29 11:15:40.340775	2025-06-29 11:15:40.340775	\N	GLOBAL	0	t	\N
15	SEC	Space Credits	SC	2025-06-29 11:15:40.340775	2025-06-29 11:15:40.340775	1	GAME_SPECIFIC	2	t	\N
16	SEG	Gold Ore	Au	2025-06-29 11:15:40.340775	2025-06-29 11:15:40.340775	1	GAME_SPECIFIC	4	t	\N
17	SEP	Platinum Ore	Pt	2025-06-29 11:15:40.340775	2025-06-29 11:15:40.340775	1	GAME_SPECIFIC	4	t	\N
18	MCE	Emerald	💎	2025-06-29 11:15:40.340775	2025-06-29 11:15:40.340775	2	GAME_SPECIFIC	0	t	\N
19	MCD	Diamond	💠	2025-06-29 11:15:40.340775	2025-06-29 11:15:40.340775	2	GAME_SPECIFIC	0	t	\N
20	VHC	Coins	C	2025-06-29 11:15:40.340775	2025-06-29 11:15:40.340775	3	GAME_SPECIFIC	0	t	\N
21	SE_CREDITS	Space Credits	SC	2025-06-29 11:15:40.340775	2025-06-29 11:15:40.340775	1	GAME_SPECIFIC	2	t	\N
\.


--
-- Data for Name: game_servers; Type: TABLE DATA; Schema: spaceengineers; Owner: -
--

COPY spaceengineers.game_servers (id, game_id, code, name, description, server_url, port, is_active, metadata, created_at, updated_at) FROM stdin;
1	1	main	Main Server	Primary Space Engineers server	\N	\N	t	\N	2025-06-29 11:15:40.340775	2025-06-29 11:15:40.340775
2	1	creative	Creative Server	Creative mode server for building	\N	\N	t	\N	2025-06-29 11:15:40.340775	2025-06-29 11:15:40.340775
3	1	survival	Survival Server	Hardcore survival server	\N	\N	t	\N	2025-06-29 11:15:40.340775	2025-06-29 11:15:40.340775
\.


--
-- Data for Name: games; Type: TABLE DATA; Schema: spaceengineers; Owner: -
--

COPY spaceengineers.games (id, code, name, description, icon_url, is_active, created_at, updated_at) FROM stdin;
1	space_engineers	Space Engineers	Space-based sandbox game about engineering, construction, exploration and survival	\N	t	2025-06-29 11:15:40.340775	2025-06-29 11:15:40.340775
2	minecraft	Minecraft	Sandbox video game developed by Mojang Studios	\N	t	2025-06-29 11:15:40.340775	2025-06-29 11:15:40.340775
3	valheim	Valheim	Survival and sandbox video game by Iron Gate Studio	\N	t	2025-06-29 11:15:40.340775	2025-06-29 11:15:40.340775
\.


--
-- Data for Name: item_download_log; Type: TABLE DATA; Schema: spaceengineers; Owner: -
--

COPY spaceengineers.item_download_log (id, storage_id, item_id, quantity, status, created_at, updated_at) FROM stdin;
1	1	9	1	CONFIRMED	2025-05-25 12:50:42.557714	2025-05-25 12:50:42.557714
2	1	9	1	CONFIRMED	2025-05-25 13:10:24.565952	2025-05-25 13:10:24.565952
3	1	9	1	CONFIRMED	2025-05-25 13:29:54.018296	2025-05-25 13:29:54.018296
4	1	9	1	CONFIRMED	2025-05-25 13:52:52.357472	2025-05-25 13:52:52.357472
5	1	9	1	CONFIRMED	2025-05-25 13:53:25.576716	2025-05-25 13:53:25.576716
6	1	9	1	CONFIRMED	2025-05-25 13:53:43.566191	2025-05-25 13:53:43.566191
7	1	199	1	CONFIRMED	2025-05-25 13:54:01.374003	2025-05-25 13:54:01.374003
8	8	199	1	CONFIRMED	2025-05-27 16:27:35.202668	2025-05-27 16:27:35.202668
9	8	199	19	CONFIRMED	2025-05-27 16:30:34.611645	2025-05-27 16:30:34.611645
10	8	165	1	CONFIRMED	2025-05-28 04:12:46.255079	2025-05-28 04:12:46.255079
11	8	166	1	CONFIRMED	2025-05-28 04:12:59.646661	2025-05-28 04:12:59.646661
12	8	175	1	CONFIRMED	2025-05-28 04:13:12.349267	2025-05-28 04:13:12.349267
13	8	176	1	CONFIRMED	2025-05-28 04:13:20.512505	2025-05-28 04:13:20.512505
14	8	185	1	CONFIRMED	2025-05-28 04:13:29.193067	2025-05-28 04:13:29.193067
15	8	186	1	CONFIRMED	2025-05-28 04:13:36.399131	2025-05-28 04:13:36.399131
16	3	199	200	CONFIRMED	2025-05-28 07:28:56.543949	2025-05-28 07:28:56.543949
17	7	199	20	CONFIRMED	2025-05-28 10:33:11.139371	2025-05-28 10:33:11.139371
18	1	9	10	CONFIRMED	2025-05-28 14:33:41.657885	2025-05-28 14:33:41.657885
19	87	199	1	CONFIRMED	2025-05-28 16:15:39.325507	2025-05-28 16:15:39.325507
20	87	199	1	CONFIRMED	2025-05-28 16:16:11.995003	2025-05-28 16:16:11.995003
21	87	199	1	CONFIRMED	2025-05-28 16:16:22.965504	2025-05-28 16:16:22.965504
22	87	199	1	CONFIRMED	2025-05-28 16:16:25.56991	2025-05-28 16:16:25.56991
23	87	199	1	CONFIRMED	2025-05-28 16:16:27.298682	2025-05-28 16:16:27.298682
24	87	199	1	CONFIRMED	2025-05-28 16:16:29.053073	2025-05-28 16:16:29.053073
25	87	199	1	CONFIRMED	2025-05-28 16:16:30.606055	2025-05-28 16:16:30.606055
26	87	199	1	CONFIRMED	2025-05-28 16:16:31.95586	2025-05-28 16:16:31.95586
27	87	199	1	CONFIRMED	2025-05-28 16:16:33.271739	2025-05-28 16:16:33.271739
28	87	199	1	CONFIRMED	2025-05-28 16:16:35.227187	2025-05-28 16:16:35.227187
29	87	199	1	CONFIRMED	2025-05-28 16:16:39.157194	2025-05-28 16:16:39.157194
30	87	199	1	CONFIRMED	2025-05-28 16:16:41.370336	2025-05-28 16:16:41.370336
31	87	199	1	CONFIRMED	2025-05-28 16:16:42.922602	2025-05-28 16:16:42.922602
32	87	199	1	CONFIRMED	2025-05-28 16:16:44.590993	2025-05-28 16:16:44.590993
33	87	199	1	CONFIRMED	2025-05-28 16:16:46.103505	2025-05-28 16:16:46.103505
34	87	199	1	CONFIRMED	2025-05-28 16:16:47.871594	2025-05-28 16:16:47.871594
35	87	199	1	CONFIRMED	2025-05-28 16:16:49.454368	2025-05-28 16:16:49.454368
36	87	199	1	CONFIRMED	2025-05-28 16:16:53.554752	2025-05-28 16:16:53.554752
37	87	199	1	CONFIRMED	2025-05-28 16:16:55.156198	2025-05-28 16:16:55.156198
38	87	199	1	CONFIRMED	2025-05-28 16:16:56.653058	2025-05-28 16:16:56.653058
39	4	199	1	CONFIRMED	2025-06-13 14:04:05.980861	2025-06-13 14:04:05.980861
40	4	199	19	CONFIRMED	2025-06-13 14:05:01.013266	2025-06-13 14:05:01.013266
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: spaceengineers; Owner: -
--

COPY spaceengineers.items (id, display_name, rarity, description, category, created_at, updated_at, icons, index_name) FROM stdin;
6	S-20A Pistol Magazine	1	\N	Ammo	2025-05-16 10:30:17.878832	2025-06-06 12:19:25.591767	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\Pistol_FullAuto_Warfare_Ammo.dds"]	MyObjectBuilder_AmmoMagazine/FullAutoPistolMagazine
7	S-10E Pistol Magazine	1	\N	Ammo	2025-05-16 10:30:17.883189	2025-06-06 12:19:25.596473	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\Pistol_Elite_Warfare_Ammo.dds"]	MyObjectBuilder_AmmoMagazine/ElitePistolMagazine
8	Flare Gun Clip	1	\N	Ammo	2025-05-16 10:30:17.885479	2025-06-06 12:19:25.600176	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\FlareGun_Ammo.dds"]	MyObjectBuilder_AmmoMagazine/FlareClip
9	Fireworks Blue	1	\N	Ammo	2025-05-16 10:30:17.888314	2025-06-06 12:19:25.603569	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\FireworksBox.dds"]	MyObjectBuilder_AmmoMagazine/FireworksBoxBlue
10	Fireworks Green	1	\N	Ammo	2025-05-16 10:30:17.8914	2025-06-06 12:19:25.607373	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\FireworksBox.dds"]	MyObjectBuilder_AmmoMagazine/FireworksBoxGreen
11	Fireworks Red	1	\N	Ammo	2025-05-16 10:30:17.89457	2025-06-06 12:19:25.610789	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\FireworksBox.dds"]	MyObjectBuilder_AmmoMagazine/FireworksBoxRed
12	Fireworks Pink	1	\N	Ammo	2025-05-16 10:30:17.898028	2025-06-06 12:19:25.614341	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\FireworksBox.dds"]	MyObjectBuilder_AmmoMagazine/FireworksBoxPink
13	Fireworks Yellow	1	\N	Ammo	2025-05-16 10:30:17.900308	2025-06-06 12:19:25.617691	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\FireworksBox.dds"]	MyObjectBuilder_AmmoMagazine/FireworksBoxYellow
14	Fireworks Rainbow	1	\N	Ammo	2025-05-16 10:30:17.902652	2025-06-06 12:19:25.620863	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\FireworksBox.dds"]	MyObjectBuilder_AmmoMagazine/FireworksBoxRainbow
15	MR-20 Rifle Magazine	1	\N	Ammo	2025-05-16 10:30:17.904666	2025-06-06 12:19:25.624603	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\Rifle_Ammo_SemiAuto.dds"]	MyObjectBuilder_AmmoMagazine/AutomaticRifleGun_Mag_20rd
16	MR-50A Rifle Magazine	1	\N	Ammo	2025-05-16 10:30:17.907444	2025-06-06 12:19:25.627832	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\Rifle_Ammo_RapidFire.dds"]	MyObjectBuilder_AmmoMagazine/RapidFireAutomaticRifleGun_Mag_50rd
17	MR-8P Rifle Magazine	1	\N	Ammo	2025-05-16 10:30:17.910903	2025-06-06 12:19:25.630984	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\Rifle_Ammo_Precise.dds"]	MyObjectBuilder_AmmoMagazine/PreciseAutomaticRifleGun_Mag_5rd
18	MR-30E Rifle Magazine	1	\N	Ammo	2025-05-16 10:30:17.914663	2025-06-06 12:19:25.634402	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\Rifle_Ammo_Elite.dds"]	MyObjectBuilder_AmmoMagazine/UltimateAutomaticRifleGun_Mag_30rd
19	5.56x45mm NATO magazine	1	\N	Ammo	2025-05-16 10:30:17.918186	2025-06-06 12:19:25.637724	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\Rifle_Ammo.dds"]	MyObjectBuilder_AmmoMagazine/NATO_5p56x45mm
20	Autocannon Magazine	1	\N	Ammo	2025-05-16 10:30:17.921361	2025-06-06 12:19:25.641101	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\AutoCanonShellBox.dds"]	MyObjectBuilder_AmmoMagazine/AutocannonClip
21	Gatling Ammo Box	1	\N	Ammo	2025-05-16 10:30:17.924426	2025-06-06 12:19:25.644352	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\Ammo_Box.dds"]	MyObjectBuilder_AmmoMagazine/NATO_25x184mm
22	Rocket	1	\N	Ammo	2025-05-16 10:30:17.927788	2025-06-06 12:19:25.647555	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\Small_Rocket.dds"]	MyObjectBuilder_AmmoMagazine/Missile200mm
23	Artillery Shell	1	\N	Ammo	2025-05-16 10:30:17.931239	2025-06-06 12:19:25.651024	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\LargeCalibreShell.dds"]	MyObjectBuilder_AmmoMagazine/LargeCalibreAmmo
24	Assault Cannon Shell	1	\N	Ammo	2025-05-16 10:30:17.934804	2025-06-06 12:19:25.654442	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\MediumCalibreShell.dds"]	MyObjectBuilder_AmmoMagazine/MediumCalibreAmmo
25	Large Railgun Sabot	1	\N	Ammo	2025-05-16 10:30:17.938573	2025-06-06 12:19:25.65798	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\RailgunAmmoLarge.dds"]	MyObjectBuilder_AmmoMagazine/LargeRailgunAmmo
26	Small Railgun Sabot	1	\N	Ammo	2025-05-16 10:30:17.943118	2025-06-06 12:19:25.661438	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\RailgunAmmo.dds"]	MyObjectBuilder_AmmoMagazine/SmallRailgunAmmo
27	Construction Comp.	1	\N	Component	2025-05-16 10:30:17.945665	2025-06-06 12:19:25.664848	["Textures\\\\GUI\\\\Icons\\\\component\\\\construction_components_component.dds"]	MyObjectBuilder_Component/Construction
28	Metal Grid	1	\N	Component	2025-05-16 10:30:17.949282	2025-06-06 12:19:25.668166	["Textures\\\\GUI\\\\Icons\\\\component\\\\metal_grid_component.dds"]	MyObjectBuilder_Component/MetalGrid
29	Interior Plate	1	\N	Component	2025-05-16 10:30:17.953766	2025-06-06 12:19:25.671794	["Textures\\\\GUI\\\\Icons\\\\component\\\\interior_plate_component.dds"]	MyObjectBuilder_Component/InteriorPlate
30	Steel Plate	1	\N	Component	2025-05-16 10:30:17.957484	2025-06-06 12:19:25.675163	["Textures\\\\GUI\\\\Icons\\\\component\\\\steel_plate_component.dds"]	MyObjectBuilder_Component/SteelPlate
31	Girder	1	\N	Component	2025-05-16 10:30:17.961174	2025-06-06 12:19:25.67869	["Textures\\\\GUI\\\\Icons\\\\component\\\\girder_component.dds"]	MyObjectBuilder_Component/Girder
32	Small Steel Tube	1	\N	Component	2025-05-16 10:30:17.964929	2025-06-06 12:19:25.68269	["Textures\\\\GUI\\\\Icons\\\\component\\\\small_tube_component.dds"]	MyObjectBuilder_Component/SmallTube
33	Large Steel Tube	1	\N	Component	2025-05-16 10:30:17.968689	2025-06-06 12:19:25.686199	["Textures\\\\GUI\\\\Icons\\\\component\\\\large_tube_component.dds"]	MyObjectBuilder_Component/LargeTube
34	Motor	1	\N	Component	2025-05-16 10:30:17.972187	2025-06-06 12:19:25.689419	["Textures\\\\GUI\\\\Icons\\\\component\\\\motor_component.dds"]	MyObjectBuilder_Component/Motor
35	Display	1	\N	Component	2025-05-16 10:30:17.975569	2025-06-06 12:19:25.692564	["Textures\\\\GUI\\\\Icons\\\\component\\\\display_component.dds"]	MyObjectBuilder_Component/Display
36	Bulletproof Glass	1	\N	Component	2025-05-16 10:30:17.97914	2025-06-06 12:19:25.69591	["Textures\\\\GUI\\\\Icons\\\\component\\\\bulletproof_glass_component.dds"]	MyObjectBuilder_Component/BulletproofGlass
37	Superconductor	1	\N	Component	2025-05-16 10:30:17.982814	2025-06-06 12:19:25.699227	["Textures\\\\GUI\\\\Icons\\\\component\\\\superconductor_conducts_component.dds"]	MyObjectBuilder_Component/Superconductor
38	Computer	1	\N	Component	2025-05-16 10:30:17.986343	2025-06-06 12:19:25.702533	["Textures\\\\GUI\\\\Icons\\\\component\\\\computer_component.dds"]	MyObjectBuilder_Component/Computer
39	Reactor Comp.	1	\N	Component	2025-05-16 10:30:17.989653	2025-06-06 12:19:25.705881	["Textures\\\\GUI\\\\Icons\\\\component\\\\reactor_components_component.dds"]	MyObjectBuilder_Component/Reactor
40	Thruster Comp.	1	\N	Component	2025-05-16 10:30:17.993239	2025-06-06 12:19:25.709359	["Textures\\\\GUI\\\\Icons\\\\component\\\\thrust_components_component.dds"]	MyObjectBuilder_Component/Thrust
41	Gravity Comp.	1	\N	Component	2025-05-16 10:30:17.996584	2025-06-06 12:19:25.712623	["Textures\\\\GUI\\\\Icons\\\\component\\\\gravity_generator_components_component.dds"]	MyObjectBuilder_Component/GravityGenerator
42	Medical Comp.	1	\N	Component	2025-05-16 10:30:18.000318	2025-06-06 12:19:25.715832	["Textures\\\\GUI\\\\Icons\\\\component\\\\medical_components_component.dds"]	MyObjectBuilder_Component/Medical
44	Detector Comp.	1	\N	Component	2025-05-16 10:30:18.027623	2025-06-06 12:19:25.722629	["Textures\\\\GUI\\\\Icons\\\\component\\\\detector_components_component.dds"]	MyObjectBuilder_Component/Detector
45	Explosives	1	\N	Component	2025-05-16 10:30:18.031589	2025-06-06 12:19:25.726545	["Textures\\\\GUI\\\\Icons\\\\component\\\\ExplosivesComponent.dds"]	MyObjectBuilder_Component/Explosives
46	Solar Cell	1	\N	Component	2025-05-16 10:30:18.037057	2025-06-06 12:19:25.730059	["Textures\\\\GUI\\\\Icons\\\\component\\\\SolarCellComponent.dds"]	MyObjectBuilder_Component/SolarCell
47	Power Cell	1	\N	Component	2025-05-16 10:30:18.054772	2025-06-06 12:19:25.733449	["Textures\\\\GUI\\\\Icons\\\\component\\\\BatteryComponent.dds"]	MyObjectBuilder_Component/PowerCell
48	Canvas	1	\N	Component	2025-05-16 10:30:18.070641	2025-06-06 12:19:25.736717	["Textures\\\\GUI\\\\Icons\\\\component\\\\Cartridge_Icon.dds"]	MyObjectBuilder_Component/Canvas
49	Engineer Plushie	1	\N	Component	2025-05-16 10:30:18.080224	2025-06-06 12:19:25.73992	["Textures\\\\GUI\\\\Icons\\\\Cubes\\\\Plushie.dds"]	MyObjectBuilder_Component/EngineerPlushie
50	Saberoid Plushie	1	\N	Component	2025-05-16 10:30:18.084707	2025-06-06 12:19:25.743217	["Textures\\\\GUI\\\\Icons\\\\Cubes\\\\SabiroidPlushie.dds"]	MyObjectBuilder_Component/SabiroidPlushie
51	Prototech Frame	1	\N	Component	2025-05-16 10:30:18.097212	2025-06-06 12:19:25.747013	["Textures\\\\GUI\\\\Icons\\\\component\\\\PrototechFrame.dds"]	MyObjectBuilder_Component/PrototechFrame
52	Prototech Panel	1	\N	Component	2025-05-16 10:30:18.105324	2025-06-06 12:19:25.750457	["Textures\\\\GUI\\\\Icons\\\\component\\\\PrototechPanel_Component.dds"]	MyObjectBuilder_Component/PrototechPanel
53	Prototech Capacitor	1	\N	Component	2025-05-16 10:30:18.109128	2025-06-06 12:19:25.753771	["Textures\\\\GUI\\\\Icons\\\\component\\\\PrototechCapacitor_Component.dds"]	MyObjectBuilder_Component/PrototechCapacitor
54	Prototech Propulsion Unit	1	\N	Component	2025-05-16 10:30:18.112905	2025-06-06 12:19:25.757026	["Textures\\\\GUI\\\\Icons\\\\component\\\\PrototechThrusterComponent.dds"]	MyObjectBuilder_Component/PrototechPropulsionUnit
55	Prototech Machinery	1	\N	Component	2025-05-16 10:30:18.11673	2025-06-06 12:19:25.760369	["Textures\\\\GUI\\\\Icons\\\\component\\\\PrototechMachinery_Icon.dds"]	MyObjectBuilder_Component/PrototechMachinery
56	Prototech Circuitry	1	\N	Component	2025-05-16 10:30:18.121192	2025-06-06 12:19:25.763517	["Textures\\\\GUI\\\\Icons\\\\component\\\\prototech_circuitry_component.dds"]	MyObjectBuilder_Component/PrototechCircuitry
57	Prototech Cooling Unit	1	\N	Component	2025-05-16 10:30:18.12519	2025-06-06 12:19:25.766692	["Textures\\\\GUI\\\\Icons\\\\component\\\\PrototechCoolingUnit.dds"]	MyObjectBuilder_Component/PrototechCoolingUnit
58	Zone Chip	1	\N	Component	2025-05-16 10:30:18.129082	2025-06-06 12:19:25.769963	["Textures\\\\GUI\\\\Icons\\\\Items\\\\ZoneChip_Item.dds"]	MyObjectBuilder_Component/ZoneChip
59	GoodAI Bot Feedback	1	\N	Component	2025-05-16 10:30:18.133602	2025-06-06 12:19:25.774229	["Textures\\\\GUI\\\\Icons\\\\Animations\\\\Thumbup.dds"]	MyObjectBuilder_PhysicalGunObject/GoodAIRewardPunishmentTool
60	Stone	1	\N	Ore	2025-05-16 10:30:18.148699	2025-06-06 12:19:25.77744	["Textures\\\\GUI\\\\Icons\\\\ore_rock.dds"]	MyObjectBuilder_Ore/Stone
61	Iron Ore	1	\N	Ore	2025-05-16 10:30:18.152868	2025-06-06 12:19:25.780784	["Textures\\\\GUI\\\\Icons\\\\ore_Fe_iron.dds"]	MyObjectBuilder_Ore/Iron
62	Nickel Ore	1	\N	Ore	2025-05-16 10:30:18.156642	2025-06-06 12:19:25.783789	["Textures\\\\GUI\\\\Icons\\\\ore_Ni_nickel.dds"]	MyObjectBuilder_Ore/Nickel
63	Cobalt Ore	1	\N	Ore	2025-05-16 10:30:18.160964	2025-06-06 12:19:25.786686	["Textures\\\\GUI\\\\Icons\\\\ore_Co_cobalt.dds"]	MyObjectBuilder_Ore/Cobalt
64	Magnesium Ore	1	\N	Ore	2025-05-16 10:30:18.165874	2025-06-06 12:19:25.789669	["Textures\\\\GUI\\\\Icons\\\\ore_Mg_magnesium.dds"]	MyObjectBuilder_Ore/Magnesium
65	Silicon Ore	1	\N	Ore	2025-05-16 10:30:18.180181	2025-06-06 12:19:25.792559	["Textures\\\\GUI\\\\Icons\\\\ore_Si_silicon.dds"]	MyObjectBuilder_Ore/Silicon
66	Silver Ore	1	\N	Ore	2025-05-16 10:30:18.184181	2025-06-06 12:19:25.795516	["Textures\\\\GUI\\\\Icons\\\\ore_Ag_silver.dds"]	MyObjectBuilder_Ore/Silver
67	Gold Ore	1	\N	Ore	2025-05-16 10:30:18.195351	2025-06-06 12:19:25.79841	["Textures\\\\GUI\\\\Icons\\\\ore_Au_gold.dds"]	MyObjectBuilder_Ore/Gold
68	Platinum Ore	1	\N	Ore	2025-05-16 10:30:18.202324	2025-06-06 12:19:25.80139	["Textures\\\\GUI\\\\Icons\\\\ore_Pt_platinum.dds"]	MyObjectBuilder_Ore/Platinum
69	Uranium Ore	1	\N	Ore	2025-05-16 10:30:18.216181	2025-06-06 12:19:25.804421	["Textures\\\\GUI\\\\Icons\\\\ore_UO2_uranite.dds"]	MyObjectBuilder_Ore/Uranium
70	Gravel	1	\N	Ingot	2025-05-16 10:30:18.220762	2025-06-06 12:19:25.807443	["Textures\\\\GUI\\\\Icons\\\\ingot\\\\gravel_ingot.dds"]	MyObjectBuilder_Ingot/Stone
71	Iron Ingot	1	\N	Ingot	2025-05-16 10:30:18.225295	2025-06-06 12:19:25.812263	["Textures\\\\GUI\\\\Icons\\\\ingot\\\\iron_ingot.dds"]	MyObjectBuilder_Ingot/Iron
73	Cobalt Ingot	1	\N	Ingot	2025-05-16 10:30:18.233309	2025-06-06 12:19:25.818756	["Textures\\\\GUI\\\\Icons\\\\ingot\\\\cobalt_ingot.dds"]	MyObjectBuilder_Ingot/Cobalt
74	Magnesium Powder	1	\N	Ingot	2025-05-16 10:30:18.237416	2025-06-06 12:19:25.821942	["Textures\\\\GUI\\\\Icons\\\\ingot\\\\magnesium_ingot.dds"]	MyObjectBuilder_Ingot/Magnesium
75	Silicon Wafer	1	\N	Ingot	2025-05-16 10:30:18.241363	2025-06-06 12:19:25.825725	["Textures\\\\GUI\\\\Icons\\\\ingot\\\\silicon_ingot.dds"]	MyObjectBuilder_Ingot/Silicon
76	Silver Ingot	1	\N	Ingot	2025-05-16 10:30:18.245123	2025-06-06 12:19:25.829274	["Textures\\\\GUI\\\\Icons\\\\ingot\\\\silver_ingot.dds"]	MyObjectBuilder_Ingot/Silver
77	Gold Ingot	1	\N	Ingot	2025-05-16 10:30:18.248757	2025-06-06 12:19:25.83257	["Textures\\\\GUI\\\\Icons\\\\ingot\\\\gold_ingot.dds"]	MyObjectBuilder_Ingot/Gold
78	Platinum Ingot	1	\N	Ingot	2025-05-16 10:30:18.252463	2025-06-06 12:19:25.835862	["Textures\\\\GUI\\\\Icons\\\\ingot\\\\platinum_ingot.dds"]	MyObjectBuilder_Ingot/Platinum
79	Uranium Ingot	1	\N	Ingot	2025-05-16 10:30:18.25604	2025-06-06 12:19:25.838911	["Textures\\\\GUI\\\\Icons\\\\ingot\\\\uranium_ingot.dds"]	MyObjectBuilder_Ingot/Uranium
80	S-10 Pistol	1	The S-10 standard issue sidearm. Built for use in a hostile environment: Simple, reliable, dependable.	Component	2025-05-16 10:30:18.259587	2025-06-06 12:19:25.842202	["Textures\\\\GUI\\\\Icons\\\\WeaponPistol_Warfare.dds"]	MyObjectBuilder_PhysicalGunObject/SemiAutoPistolItem
82	S-10E Pistol	1	An S-10 variant, the E model sidearm features a modified "feather" trigger and boasts a red dot sight.	Component	2025-05-16 10:30:18.266827	2025-06-06 12:19:25.855104	["Textures\\\\GUI\\\\Icons\\\\WeaponPistol_Elite_Warfare.dds"]	MyObjectBuilder_PhysicalGunObject/ElitePistolItem
83	Flare Gun	1	Flare Guns can be used to signal your position to others or to temporarily illuminate your surroundings.	Component	2025-05-16 10:30:18.271355	2025-06-06 12:19:25.858801	["Textures\\\\GUI\\\\Icons\\\\FlareGun.dds"]	MyObjectBuilder_PhysicalGunObject/FlareGunItem
84	MR-20 Rifle	1	The MR-20 is a staple of both military and police forces. An exceptionally reliable rifle. Easy to use, easy to clean.	Component	2025-05-16 10:30:18.277136	2025-06-06 12:19:25.861749	["Textures\\\\GUI\\\\Icons\\\\WeaponAutomaticRifle.dds"]	MyObjectBuilder_PhysicalGunObject/AutomaticRifleItem
85	MR-8P Rifle	1	The MR-8P is designed for long range engagements. The model 8P makes use of a much heavier barrel to achieve unmatched accuracy and stopping power.	Component	2025-05-16 10:30:18.28183	2025-06-06 12:19:25.865689	["Textures\\\\GUI\\\\Icons\\\\WeaponAutomaticRifle_Precise.dds"]	MyObjectBuilder_PhysicalGunObject/PreciseAutomaticRifleItem
86	MR-50A Rifle	1	The MR-50A enjoys notoriety as the smallest squad support machine gun in modern use.  The model 50A can unleash a withering stream of suppressive fire, at a rate of 550 RPM.	Component	2025-05-16 10:30:18.285675	2025-06-06 12:19:25.869079	["Textures\\\\GUI\\\\Icons\\\\WeaponAutomaticRifle_RapidFire.dds"]	MyObjectBuilder_PhysicalGunObject/RapidFireAutomaticRifleItem
87	MR-30E Rifle	1	The MR-30E is a modernized and battle-ready version of the well known model 20. The model 30E features 3-round burst-fire, an extended magazine, and a red dot sight.	Component	2025-05-16 10:30:18.289399	2025-06-06 12:19:25.872338	["Textures\\\\GUI\\\\Icons\\\\WeaponAutomaticRifle_Elite.dds"]	MyObjectBuilder_PhysicalGunObject/UltimateAutomaticRifleItem
88	RO-1 Rocket Launcher	1	Shoulder fired rocket ordinance. Launches a rocket propelled anti-vehicle projectile.	Component	2025-05-16 10:30:18.29324	2025-06-06 12:19:25.875713	["Textures\\\\GUI\\\\Icons\\\\WeaponRocketLauncher_Regular.dds"]	MyObjectBuilder_PhysicalGunObject/BasicHandHeldLauncherItem
89	PRO-1 Rocket Launcher	1	Building on the reliable design of the RO-1 the PRO-1 provides a number of battlefield improvements, including a precision scope.	Component	2025-05-16 10:30:18.297965	2025-06-06 12:19:25.878778	["Textures\\\\GUI\\\\Icons\\\\WeaponRocketLauncher_Precise.dds"]	MyObjectBuilder_PhysicalGunObject/AdvancedHandHeldLauncherItem
90	Oxygen Bottle	1	\N	Unknown	2025-05-16 10:30:18.303343	2025-06-06 12:19:25.883122	["Textures\\\\GUI\\\\Icons\\\\component\\\\OxygenBottleComponent.dds"]	MyObjectBuilder_OxygenContainerObject/OxygenBottle
91	Hydrogen Bottle	1	\N	Unknown	2025-05-16 10:30:18.308605	2025-06-06 12:19:25.886777	["Textures\\\\GUI\\\\Icons\\\\component\\\\HydrogenBottle_Component.dds"]	MyObjectBuilder_GasContainerObject/HydrogenBottle
92	Welder	1	A tool for building and repairing. Hold ABASE:PRIMARY_TOOL_ACTION to weld. Press ABASE:SECONDARY_TOOL_ACTION to put missing components to Build Planner.	Component	2025-05-16 10:30:18.3128	2025-06-06 12:19:25.889916	["Textures\\\\GUI\\\\Icons\\\\WeaponWelder.dds"]	MyObjectBuilder_PhysicalGunObject/WelderItem
93	Enhanced Welder	1	A tool for building and repairing. Hold ABASE:PRIMARY_TOOL_ACTION to weld. Press ABASE:SECONDARY_TOOL_ACTION to put missing components to Build Planner.	Component	2025-05-16 10:30:18.318295	2025-06-06 12:19:25.893234	["Textures\\\\GUI\\\\Icons\\\\WeaponWelder_1.dds"]	MyObjectBuilder_PhysicalGunObject/Welder2Item
94	Proficient Welder	1	A tool for building and repairing. Hold ABASE:PRIMARY_TOOL_ACTION to weld. Press ABASE:SECONDARY_TOOL_ACTION to put missing components to Build Planner.	Component	2025-05-16 10:30:18.32213	2025-06-06 12:19:25.896343	["Textures\\\\GUI\\\\Icons\\\\WeaponWelder_2.dds"]	MyObjectBuilder_PhysicalGunObject/Welder3Item
95	Elite Welder	1	A tool for building and repairing. Hold ABASE:PRIMARY_TOOL_ACTION to weld. Press ABASE:SECONDARY_TOOL_ACTION to put missing components to Build Planner.	Component	2025-05-16 10:30:18.326294	2025-06-06 12:19:25.89961	["Textures\\\\GUI\\\\Icons\\\\WeaponWelder_3.dds"]	MyObjectBuilder_PhysicalGunObject/Welder4Item
96	Grinder	1	A tool for deconstructing and salvaging. Hold ABASE:PRIMARY_TOOL_ACTION to grind. 	Component	2025-05-16 10:30:18.339854	2025-06-06 12:19:25.902638	["Textures\\\\GUI\\\\Icons\\\\WeaponGrinder.dds"]	MyObjectBuilder_PhysicalGunObject/AngleGrinderItem
97	Enhanced Grinder	1	A tool for deconstructing and salvaging. Hold ABASE:PRIMARY_TOOL_ACTION to grind. 	Component	2025-05-16 10:30:18.343056	2025-06-06 12:19:25.906385	["Textures\\\\GUI\\\\Icons\\\\WeaponGrinder_1.dds"]	MyObjectBuilder_PhysicalGunObject/AngleGrinder2Item
98	Proficient Grinder	1	A tool for deconstructing and salvaging. Hold ABASE:PRIMARY_TOOL_ACTION to grind. 	Component	2025-05-16 10:30:18.346948	2025-06-06 12:19:25.909529	["Textures\\\\GUI\\\\Icons\\\\WeaponGrinder_2.dds"]	MyObjectBuilder_PhysicalGunObject/AngleGrinder3Item
99	Elite Grinder	1	A tool for deconstructing and salvaging. Hold ABASE:PRIMARY_TOOL_ACTION to grind. 	Component	2025-05-16 10:30:18.350912	2025-06-06 12:19:25.912659	["Textures\\\\GUI\\\\Icons\\\\WeaponGrinder_3.dds"]	MyObjectBuilder_PhysicalGunObject/AngleGrinder4Item
100	Hand Drill	1	A tool to break down rock to collect minerals. Hold down ABASE:PRIMARY_TOOL_ACTION to drill. Hold ABASE:SECONDARY_TOOL_ACTION to quickly dig tunnels. 	Component	2025-05-16 10:30:18.354929	2025-06-06 12:19:25.915801	["Textures\\\\GUI\\\\Icons\\\\WeaponDrill.dds"]	MyObjectBuilder_PhysicalGunObject/HandDrillItem
101	Enhanced Hand Drill	1	A tool to break down rock to collect minerals. Hold down ABASE:PRIMARY_TOOL_ACTION to drill. Hold ABASE:SECONDARY_TOOL_ACTION to quickly dig tunnels. 	Component	2025-05-16 10:30:18.358725	2025-06-06 12:19:25.918888	["Textures\\\\GUI\\\\Icons\\\\WeaponDrill_1.dds"]	MyObjectBuilder_PhysicalGunObject/HandDrill2Item
102	Proficient Hand Drill	1	A tool to break down rock to collect minerals. Hold down ABASE:PRIMARY_TOOL_ACTION to drill. Hold ABASE:SECONDARY_TOOL_ACTION to quickly dig tunnels. 	Component	2025-05-16 10:30:18.362453	2025-06-06 12:19:25.922159	["Textures\\\\GUI\\\\Icons\\\\WeaponDrill_2.dds"]	MyObjectBuilder_PhysicalGunObject/HandDrill3Item
103	Elite Hand Drill	1	A tool to break down rock to collect minerals. Hold down ABASE:PRIMARY_TOOL_ACTION to drill. Hold ABASE:SECONDARY_TOOL_ACTION to quickly dig tunnels. 	Component	2025-05-16 10:30:18.366411	2025-06-06 12:19:25.925383	["Textures\\\\GUI\\\\Icons\\\\WeaponDrill_3.dds"]	MyObjectBuilder_PhysicalGunObject/HandDrill4Item
105	Scrap Metal	1	\N	Ore	2025-05-16 10:30:18.373544	2025-06-06 12:19:25.932259	["Textures\\\\GUI\\\\Icons\\\\component\\\\ScrapMetalComponent.dds"]	MyObjectBuilder_Ore/Scrap
106	Old Scrap Metal	1	\N	Ingot	2025-05-16 10:30:18.376679	2025-06-06 12:19:25.935604	["Textures\\\\GUI\\\\Icons\\\\component\\\\ScrapMetalComponent.dds"]	MyObjectBuilder_Ingot/Scrap
107	Prototech Scrap	1	\N	Ingot	2025-05-16 10:30:18.379962	2025-06-06 12:19:25.938834	["Textures\\\\GUI\\\\Icons\\\\component\\\\ScrapPrototechComponent.dds"]	MyObjectBuilder_Ingot/PrototechScrap
108	Ice	1	\N	Ore	2025-05-16 10:30:18.383472	2025-06-06 12:19:25.942029	["Textures\\\\GUI\\\\Icons\\\\ore_H2O_ice.dds"]	MyObjectBuilder_Ore/Ice
109	Organic	1	\N	Ore	2025-05-16 10:30:18.386782	2025-06-06 12:19:25.945339	["Textures\\\\GUI\\\\Icons\\\\ore_biomass.dds"]	MyObjectBuilder_Ore/Organic
126	Clang Kola	1	Surprisingly strong kola. The recipe for this delicious beverage remains the best kept secret in the solar system.	Unknown	2025-05-16 10:30:18.459329	2025-06-06 12:19:25.959961	["Textures\\\\GUI\\\\Icons\\\\Items\\\\ClangCola.dds"]	MyObjectBuilder_ConsumableItem/ClangCola
127	Cosmic Coffee	1	Brewed with the utmost care by Martian coffee growers, it's guaranteed to help you stay awake in space.	Unknown	2025-05-16 10:30:18.464468	2025-06-06 12:19:25.965507	["Textures\\\\GUI\\\\Icons\\\\Items\\\\CosmicCoffee.dds"]	MyObjectBuilder_ConsumableItem/CosmicCoffee
128	Datapad	1	A datapad is an electronic device used to store and display information.	Unknown	2025-05-16 10:30:18.472634	2025-06-06 12:19:25.967761	["Textures\\\\GUI\\\\Icons\\\\Items\\\\Datapad_Item.dds"]	MyObjectBuilder_Datapad/Datapad
129	Package	1	A package is a box used for storing items for Hauling contract.	Unknown	2025-05-16 10:30:18.477192	2025-06-06 12:19:25.973822	["Textures\\\\GUI\\\\Icons\\\\Items\\\\ContractPackage.dds"]	MyObjectBuilder_Package/Package
130	Medkit	1	A medkit is a case containing medical supplies for healing astronaut.	Unknown	2025-05-16 10:30:18.479282	2025-06-06 12:19:25.975813	["Textures\\\\GUI\\\\Icons\\\\Items\\\\MedKit.dds"]	MyObjectBuilder_ConsumableItem/Medkit
131	Powerkit	1	A powerkit is a portable battery pack for recharging suit of an astronaut.	Unknown	2025-05-16 10:30:18.481161	2025-06-06 12:19:25.977617	["Textures\\\\GUI\\\\Icons\\\\Items\\\\PowerKit.dds"]	MyObjectBuilder_ConsumableItem/Powerkit
132	Space Credit	1	A Space Credit is a currency used for trading.	Unknown	2025-05-16 10:30:18.483039	2025-06-06 12:19:25.979274	["Textures\\\\GUI\\\\Icons\\\\Items\\\\SpaceCredit.dds"]	MyObjectBuilder_PhysicalObject/SpaceCredit
134	Binoculars	1	Binoculars	Component	2025-05-16 10:30:18.487073	2025-06-06 12:19:25.982181	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\2777644246\\\\Textures\\\\Icons\\\\Binoculars.dds"]	MyObjectBuilder_PhysicalGunObject/BinocularsItem
135	Defense Module Lv 1	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Defense level +1.	Component	2025-05-16 10:30:18.488874	2025-06-06 12:19:25.983744	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\skyblue-01.dds"]	MyObjectBuilder_Component/DefenseUpgradeModule_Level1
136	Defense Module Lv 2	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Defense level +2.	Component	2025-05-16 10:30:18.50357	2025-06-06 12:19:25.98525	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\skyblue-02.dds"]	MyObjectBuilder_Component/DefenseUpgradeModule_Level2
137	Defense Module Lv 3	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Defense level +3.	Component	2025-05-16 10:30:18.505065	2025-06-06 12:19:25.988187	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\skyblue-03.dds"]	MyObjectBuilder_Component/DefenseUpgradeModule_Level3
138	Defense Module Lv 4	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Defense level +4.	Component	2025-05-16 10:30:18.506937	2025-06-06 12:19:25.989855	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\skyblue-04.dds"]	MyObjectBuilder_Component/DefenseUpgradeModule_Level4
139	Defense Module Lv 5	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Defense level +5.	Component	2025-05-16 10:30:18.508587	2025-06-06 12:19:25.991768	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\skyblue-05.dds"]	MyObjectBuilder_Component/DefenseUpgradeModule_Level5
140	Defense Module Lv 6	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Defense level +6.	Component	2025-05-16 10:30:18.509966	2025-06-06 12:19:25.993364	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\skyblue-06.dds"]	MyObjectBuilder_Component/DefenseUpgradeModule_Level6
141	Defense Module Lv 7	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Defense level +7.	Component	2025-05-16 10:30:18.511493	2025-06-06 12:19:25.994744	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\skyblue-07.dds"]	MyObjectBuilder_Component/DefenseUpgradeModule_Level7
142	Defense Module Lv 8	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Defense level +8.	Component	2025-05-16 10:30:18.523086	2025-06-06 12:19:25.996132	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\skyblue-08.dds"]	MyObjectBuilder_Component/DefenseUpgradeModule_Level8
143	Defense Module Lv 9	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Defense level +9.	Component	2025-05-16 10:30:18.524651	2025-06-06 12:19:25.997618	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\skyblue-09.dds"]	MyObjectBuilder_Component/DefenseUpgradeModule_Level9
145	Attack Module Lv 1	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Attack level +1.	Component	2025-05-16 10:30:18.527789	2025-06-06 12:19:26.001553	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\red-01.dds"]	MyObjectBuilder_Component/AttackUpgradeModule_Level1
146	Attack Module Lv 2	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Attack level +2.	Component	2025-05-16 10:30:18.529198	2025-06-06 12:19:26.004549	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\red-02.dds"]	MyObjectBuilder_Component/AttackUpgradeModule_Level2
147	Attack Module Lv 3	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Attack level +3.	Component	2025-05-16 10:30:18.53054	2025-06-06 12:19:26.010337	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\red-03.dds"]	MyObjectBuilder_Component/AttackUpgradeModule_Level3
148	Attack Module Lv 4	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Attack level +4.	Component	2025-05-16 10:30:18.531731	2025-06-06 12:19:26.012428	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\red-04.dds"]	MyObjectBuilder_Component/AttackUpgradeModule_Level4
149	Attack Module Lv 5	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Attack level +5.	Component	2025-05-16 10:30:18.533008	2025-06-06 12:19:26.014368	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\red-05.dds"]	MyObjectBuilder_Component/AttackUpgradeModule_Level5
150	Attack Module Lv 6	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Attack level +6.	Component	2025-05-16 10:30:18.534343	2025-06-06 12:19:26.015821	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\red-06.dds"]	MyObjectBuilder_Component/AttackUpgradeModule_Level6
151	Attack Module Lv 7	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Attack level +7.	Component	2025-05-16 10:30:18.537839	2025-06-06 12:19:26.017481	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\red-07.dds"]	MyObjectBuilder_Component/AttackUpgradeModule_Level7
152	Attack Module Lv 8	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Attack level +8.	Component	2025-05-16 10:30:18.539466	2025-06-06 12:19:26.021543	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\red-08.dds"]	MyObjectBuilder_Component/AttackUpgradeModule_Level8
153	Attack Module Lv 9	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Attack level +9.	Component	2025-05-16 10:30:18.540757	2025-06-06 12:19:26.023545	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\red-09.dds"]	MyObjectBuilder_Component/AttackUpgradeModule_Level9
154	Attack Module Lv 10	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Attack level +10.	Component	2025-05-16 10:30:18.542062	2025-06-06 12:19:26.024736	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\red-10.dds"]	MyObjectBuilder_Component/AttackUpgradeModule_Level10
155	Power Efficiency Module Lv 1	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Power efficiency level +1.	Component	2025-05-16 10:30:18.543972	2025-06-06 12:19:26.033717	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\yellow-01.dds"]	MyObjectBuilder_Component/PowerEfficiencyUpgradeModule_Level1
156	Power Efficiency Module Lv 2	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Power efficiency level +2.	Component	2025-05-16 10:30:18.545206	2025-06-06 12:19:26.035905	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\yellow-02.dds"]	MyObjectBuilder_Component/PowerEfficiencyUpgradeModule_Level2
157	Power Efficiency Module Lv 3	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Power efficiency level +3.	Component	2025-05-16 10:30:18.546494	2025-06-06 12:19:26.039011	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\yellow-03.dds"]	MyObjectBuilder_Component/PowerEfficiencyUpgradeModule_Level3
158	Power Efficiency Module Lv 4	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Power efficiency level +4.	Component	2025-05-16 10:30:18.548009	2025-06-06 12:19:26.042419	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\yellow-04.dds"]	MyObjectBuilder_Component/PowerEfficiencyUpgradeModule_Level4
404	FH65 "Perun" Arbor DMR	1	\r\n\t\t\tConsolidation's Kinetic DMR\r\n\t\t\tAmmo: OPC DMR 7.65x75 magazine\r\n\t\t\tDistance max: 1250 meters\r\n\t\t	Component	2025-06-06 12:19:26.271841	2025-06-06 12:19:26.271841	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_DMR_green.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_DMR4_item
159	Power Efficiency Module Lv 5	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Power efficiency level +5.	Component	2025-05-16 10:30:18.550604	2025-06-06 12:19:26.045944	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\yellow-05.dds"]	MyObjectBuilder_Component/PowerEfficiencyUpgradeModule_Level5
160	Power Efficiency Module Lv 6	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Power efficiency level +6.	Component	2025-05-16 10:30:18.55209	2025-06-06 12:19:26.04942	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\yellow-06.dds"]	MyObjectBuilder_Component/PowerEfficiencyUpgradeModule_Level6
162	Power Efficiency Module Lv 8	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Power efficiency level +8.	Component	2025-05-16 10:30:18.555442	2025-06-06 12:19:26.056465	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\yellow-08.dds"]	MyObjectBuilder_Component/PowerEfficiencyUpgradeModule_Level8
163	Power Efficiency Module Lv 9	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Power efficiency level +9.	Component	2025-05-16 10:30:18.556594	2025-06-06 12:19:26.059711	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\yellow-09.dds"]	MyObjectBuilder_Component/PowerEfficiencyUpgradeModule_Level9
164	Power Efficiency Module Lv 10	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Power efficiency level +10.	Component	2025-05-16 10:30:18.557789	2025-06-06 12:19:26.062838	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\yellow-10.dds"]	MyObjectBuilder_Component/PowerEfficiencyUpgradeModule_Level10
165	Berserker Module Lv 1	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Attack level +1, Defense level -1, Power Efficiency level -1.	Component	2025-05-16 10:30:18.559177	2025-06-06 12:19:26.064736	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\purple-01.dds"]	MyObjectBuilder_Component/BerserkerModule_Level1
166	Berserker Module Lv 2	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Attack level +2, Defense level -2, Power Efficiency level -2.	Component	2025-05-16 10:30:18.560418	2025-06-06 12:19:26.068227	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\purple-02.dds"]	MyObjectBuilder_Component/BerserkerModule_Level2
167	Berserker Module Lv 3	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Attack level +3, Defense level -3, Power Efficiency level -3.	Component	2025-05-16 10:30:18.561592	2025-06-06 12:19:26.071296	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\purple-03.dds"]	MyObjectBuilder_Component/BerserkerModule_Level3
168	Berserker Module Lv 4	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Attack level +4, Defense level -4, Power Efficiency level -4.	Component	2025-05-16 10:30:18.573129	2025-06-06 12:19:26.076657	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\purple-04.dds"]	MyObjectBuilder_Component/BerserkerModule_Level4
169	Berserker Module Lv 5	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Attack level +5, Defense level -5, Power Efficiency level -5.	Component	2025-05-16 10:30:18.574696	2025-06-06 12:19:26.080115	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\purple-05.dds"]	MyObjectBuilder_Component/BerserkerModule_Level5
170	Berserker Module Lv 6	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Attack level +6, Defense level -6, Power Efficiency level -6.	Component	2025-05-16 10:30:18.576724	2025-06-06 12:19:26.083575	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\purple-06.dds"]	MyObjectBuilder_Component/BerserkerModule_Level6
171	Berserker Module Lv 7	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Attack level +7, Defense level -7, Power Efficiency level -7.	Component	2025-05-16 10:30:18.579641	2025-06-06 12:19:26.089354	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\purple-07.dds"]	MyObjectBuilder_Component/BerserkerModule_Level7
172	Berserker Module Lv 8	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Attack level +8, Defense level -8, Power Efficiency level -8.	Component	2025-05-16 10:30:18.581566	2025-06-06 12:19:26.095019	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\purple-08.dds"]	MyObjectBuilder_Component/BerserkerModule_Level8
405	FH13 "Ophois" Signature Pistol	1	\r\n\t\t\tConsolidation's Kinetic pistol\r\n\t\t\tAmmo: OPC Pistol 5.39x13 magazine\r\n\t\t\tDistance max: 300 meters\r\n\t\t	Component	2025-06-06 12:19:26.274914	2025-06-06 12:19:26.274914	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_Pistol_opc.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_Pistol1_item
174	Berserker Module Lv 10	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Attack level +10, Defense level -10, Power Efficiency level -10.	Component	2025-05-16 10:30:18.585379	2025-06-06 12:19:26.10332	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\purple-10.dds"]	MyObjectBuilder_Component/BerserkerModule_Level10
175	Speed Module Lv 1	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Speed level +1, Power Efficiency level -1.	Component	2025-05-16 10:30:18.589119	2025-06-06 12:19:26.107381	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\green-01.dds"]	MyObjectBuilder_Component/SpeedModule_Level1
176	Speed Module Lv 2	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Speed level +2, Power Efficiency level -2.	Component	2025-05-16 10:30:18.592294	2025-06-06 12:19:26.111289	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\green-02.dds"]	MyObjectBuilder_Component/SpeedModule_Level2
177	Speed Module Lv 3	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Speed level +3, Power Efficiency level -3.	Component	2025-05-16 10:30:18.595482	2025-06-06 12:19:26.114673	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\green-03.dds"]	MyObjectBuilder_Component/SpeedModule_Level3
178	Speed Module Lv 4	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Speed level +4, Power Efficiency level -4.	Component	2025-05-16 10:30:18.598705	2025-06-06 12:19:26.11783	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\green-04.dds"]	MyObjectBuilder_Component/SpeedModule_Level4
179	Speed Module Lv 5	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Speed level +5, Power Efficiency level -5.	Component	2025-05-16 10:30:18.60188	2025-06-06 12:19:26.121041	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\green-05.dds"]	MyObjectBuilder_Component/SpeedModule_Level5
180	Speed Module Lv 6	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Speed level +6, Power Efficiency level -6.	Component	2025-05-16 10:30:18.605081	2025-06-06 12:19:26.124586	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\green-06.dds"]	MyObjectBuilder_Component/SpeedModule_Level6
181	Speed Module Lv 7	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Speed level +7,Power Efficiency level -7.	Component	2025-05-16 10:30:18.608365	2025-06-06 12:19:26.128195	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\green-07.dds"]	MyObjectBuilder_Component/SpeedModule_Level7
182	Speed Module Lv 8	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Speed level +8, Power Efficiency level -8.	Component	2025-05-16 10:30:18.611828	2025-06-06 12:19:26.131449	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\green-08.dds"]	MyObjectBuilder_Component/SpeedModule_Level8
183	Speed Module Lv 9	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Speed level +9, Power Efficiency level -9.	Component	2025-05-16 10:30:18.61948	2025-06-06 12:19:26.135505	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\green-09.dds"]	MyObjectBuilder_Component/SpeedModule_Level9
184	Speed Module Lv 10	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Speed level +10, Power Efficiency level -10.	Component	2025-05-16 10:30:18.623498	2025-06-06 12:19:26.138937	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\green-10.dds"]	MyObjectBuilder_Component/SpeedModule_Level10
185	Fortress Module Lv 1	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Speed level -1, Defense level +1, Power Efficiency level -1.	Component	2025-05-16 10:30:18.627529	2025-06-06 12:19:26.142232	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\orange-01.dds"]	MyObjectBuilder_Component/FortressModule_Level1
186	Fortress Module Lv 2	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Speed level -2, Defense level +2, Power Efficiency level -2.	Component	2025-05-16 10:30:18.631736	2025-06-06 12:19:26.145752	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\orange-02.dds"]	MyObjectBuilder_Component/FortressModule_Level2
187	Fortress Module Lv 3	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Speed level -3, Defense level +3, Power Efficiency level -3.	Component	2025-05-16 10:30:18.635782	2025-06-06 12:19:26.149297	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\orange-03.dds"]	MyObjectBuilder_Component/FortressModule_Level3
5	S-10 Pistol Magazine	1	\N	Ammo	2025-05-16 10:30:17.866562	2025-06-06 12:19:25.585692	["Textures\\\\GUI\\\\Icons\\\\ammo\\\\Pistol_Warfare_Ammo.dds"]	MyObjectBuilder_AmmoMagazine/SemiAutoPistolMagazine
43	Radio-comm Comp.	1	\N	Component	2025-05-16 10:30:18.010429	2025-06-06 12:19:25.719071	["Textures\\\\GUI\\\\Icons\\\\component\\\\radio_communication_components_component.dds"]	MyObjectBuilder_Component/RadioCommunication
72	Nickel Ingot	1	\N	Ingot	2025-05-16 10:30:18.22925	2025-06-06 12:19:25.815358	["Textures\\\\GUI\\\\Icons\\\\ingot\\\\nickel_ingot.dds"]	MyObjectBuilder_Ingot/Nickel
81	S-20A Pistol	1	A true "next-generation" sidearm. Featuring heat resistant components, a full-auto trigger group, and extended ammo capacity. The S-20A is purpose-built to take it to the next level.	Component	2025-05-16 10:30:18.263045	2025-06-06 12:19:25.845507	["Textures\\\\GUI\\\\Icons\\\\WeaponPistol_FullAuto_Warfare.dds"]	MyObjectBuilder_PhysicalGunObject/FullAutoPistolItem
144	Defense Module Lv 10	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Defense level +10.	Component	2025-05-16 10:30:18.52624	2025-06-06 12:19:25.999347	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\skyblue-10.dds"]	MyObjectBuilder_Component/DefenseUpgradeModule_Level10
161	Power Efficiency Module Lv 7	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Power efficiency level +7.	Component	2025-05-16 10:30:18.554014	2025-06-06 12:19:26.052791	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\yellow-07.dds"]	MyObjectBuilder_Component/PowerEfficiencyUpgradeModule_Level7
188	Fortress Module Lv 4	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Speed level -4, Defense level +4, Power Efficiency level -4.	Component	2025-05-16 10:30:18.639442	2025-06-06 12:19:26.152727	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\orange-04.dds"]	MyObjectBuilder_Component/FortressModule_Level4
189	Fortress Module Lv 5	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Speed level -5, Defense level +5, Power Efficiency level -5.	Component	2025-05-16 10:30:18.643113	2025-06-06 12:19:26.155971	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\orange-05.dds"]	MyObjectBuilder_Component/FortressModule_Level5
190	Fortress Module Lv 6	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Speed level -6, Defense level +6, Power Efficiency level -6.	Component	2025-05-16 10:30:18.646901	2025-06-06 12:19:26.159429	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\orange-06.dds"]	MyObjectBuilder_Component/FortressModule_Level6
191	Fortress Module Lv 7	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Speed level -7, Defense level +7, Power Efficiency level -7.	Component	2025-05-16 10:30:18.650525	2025-06-06 12:19:26.16294	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\orange-07.dds"]	MyObjectBuilder_Component/FortressModule_Level7
192	Fortress Module Lv 8	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Speed level -8, Defense level +8, Power Efficiency level -8.	Component	2025-05-16 10:30:18.66317	2025-06-06 12:19:26.165975	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\orange-08.dds"]	MyObjectBuilder_Component/FortressModule_Level8
193	Fortress Module Lv 9	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Speed level -9, Defense level +9, Power Efficiency level -9.	Component	2025-05-16 10:30:18.665668	2025-06-06 12:19:26.169078	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\orange-09.dds"]	MyObjectBuilder_Component/FortressModule_Level9
194	Fortress Module Lv 10	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Speed level -10, Defense level +10, Power Efficiency level -10.	Component	2025-05-16 10:30:18.668565	2025-06-06 12:19:26.172335	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\orange-10.dds"]	MyObjectBuilder_Component/FortressModule_Level10
195	Lanthanum Ore	1	\N	Ore	2025-05-16 10:30:18.671446	2025-06-06 12:19:26.176199	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\Icons\\\\Lanthanum.dds"]	MyObjectBuilder_Ore/LanthanumOre
196	Lanthanum Ingot	1	\N	Ingot	2025-05-16 10:30:18.67425	2025-06-06 12:19:26.179965	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\Icons\\\\LanthanumIngot.dds"]	MyObjectBuilder_Ingot/Lanthanum
197	Cerium Ore	1	\N	Ore	2025-05-16 10:30:18.677003	2025-06-06 12:19:26.183605	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\Icons\\\\Cerium.dds"]	MyObjectBuilder_Ore/CeriumOre
198	Cerium Ingot	1	\N	Ingot	2025-05-16 10:30:18.679678	2025-06-06 12:19:26.186819	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\Icons\\\\CeriumIngot.dds"]	MyObjectBuilder_Ingot/Cerium
199	Prime Matter	1	\N	Component	2025-05-16 10:30:18.682506	2025-06-06 12:19:26.190021	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3350158775\\\\Textures\\\\Prime_Matter.dds"]	MyObjectBuilder_Component/Prime_Matter
406	FH13 "Ophois" Glacier Pistol	1	\r\n\t\t\tConsolidation's Kinetic pistol\r\n\t\t\tAmmo: OPC Pistol 5.39x13 magazine\r\n\t\t\tDistance max: 300 meters\r\n\t\t	Component	2025-06-06 12:19:26.278111	2025-06-06 12:19:26.278111	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_Pistol_white.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_Pistol2_item
173	Berserker Module Lv 9	1	To apply the upgrade module, rename the cockpit block with an inventory to include '[Upgrade]' in its name, and place the module in the block's inventory. Only one module of each type can be applied. Attack level +9, Defense level -9, Power Efficiency level -9.	Component	2025-05-16 10:30:18.583551	2025-06-06 12:19:26.098911	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3341019311\\\\Textures\\\\GUI\\\\Icons\\\\component\\\\modules\\\\purple-09.dds"]	MyObjectBuilder_Component/BerserkerModule_Level9
382	OPC S0 "Mars" missile x1	1	\r\n\t\t\tA general purpose size 0 missile, used by Consolidation missile-based weapon systems\r\n\t\t	Ammo	2025-06-06 12:19:26.197423	2025-06-06 12:19:26.197423	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\ammo\\\\MSL_HEAT_011x1_Magazine.dds"]	MyObjectBuilder_AmmoMagazine/MSL_HEAT_011x1_Magazine
383	OPC S0 "Mars" missile x12	1	\r\n\t\t\tA pack of twelwe general purpose size 0 missiles, used by Consolidation missile-based weapon systems\r\n\t\t	Ammo	2025-06-06 12:19:26.200709	2025-06-06 12:19:26.200709	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3390725823\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\MSL_HEAT_011x12_Magazine.dds"]	MyObjectBuilder_AmmoMagazine/MSL_HEAT_011x12_Magazine
384	OPC S1 "Thor" missile	1	\r\n\t\t\tAn EMP size 1 missile, used by Consolidation missile-based weapon systems\r\n\t\t	Ammo	2025-06-06 12:19:26.204285	2025-06-06 12:19:26.204285	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3390725823\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\MSL_EMPW_101.dds"]	MyObjectBuilder_AmmoMagazine/MSL_EMPW_101_Magazine
385	OPC S1 "Odin" missile	1	\r\n\t\t\tA general purpose size 1 missile, used by Consolidation missile-based weapon systems\r\n\t\t	Ammo	2025-06-06 12:19:26.208786	2025-06-06 12:19:26.208786	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3390725823\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\MSL_HEAT_102.dds"]	MyObjectBuilder_AmmoMagazine/MSL_HEAT_102_Magazine
386	OPC S1 "Loki" missile	1	\r\n\t\t\tA decoy size 1 missile, used by Consolidation missile-based weapon systems\r\n\t\t	Ammo	2025-06-06 12:19:26.212593	2025-06-06 12:19:26.212593	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3390725823\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\MSL_DCOY_103.dds"]	MyObjectBuilder_AmmoMagazine/MSL_DCOY_103_Magazine
387	OPC S2 "Ares" missile	1	\r\n\t\t\tA general purpose size 2 missile, used by Consolidation missile-based weapon systems\r\n\t\t	Ammo	2025-06-06 12:19:26.215964	2025-06-06 12:19:26.215964	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3390725823\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\MSL_HEAT_206.dds"]	MyObjectBuilder_AmmoMagazine/MSL_HEAT_206_Magazine
388	OPC S2 "Zeus" missile	1	\r\n\t\t\tAn EMP size 2 missile, used by Consolidation missile-based weapon systems\r\n\t\t	Ammo	2025-06-06 12:19:26.219254	2025-06-06 12:19:26.219254	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3390725823\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\MSL_EMPW_207.dds"]	MyObjectBuilder_AmmoMagazine/MSL_EMPW_207_Magazine
389	OPC S3 "Morrígan" missile	1	\r\n\t\t\tA general purpose size 3 cruise missile, used by Consolidation missile-based weapon systems\r\n\t\t	Ammo	2025-06-06 12:19:26.222626	2025-06-06 12:19:26.222626	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3390725823\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\MSL_CRUS_308.dds"]	MyObjectBuilder_AmmoMagazine/MSL_CRUS_308_Magazine
390	OPC Astarte S0 Charge cell dummy	1	\N	Ammo	2025-06-06 12:19:26.225876	2025-06-06 12:19:26.225876	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\ammo\\\\OPC_Mag_Plasma.dds"]	MyObjectBuilder_AmmoMagazine/OPC_Plasma_Charge_S0_Mag_dummy
391	OPC Plasma Cannon cell	1	OPC Plasma Cannon cell	Ammo	2025-06-06 12:19:26.229312	2025-06-06 12:19:26.229312	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\ammo\\\\OPC_Mag_Plasma.dds"]	MyObjectBuilder_AmmoMagazine/OPC_Plasma_Charge_S0_Mag
392	OPC Perun 13rd dummy	1	\N	Ammo	2025-06-06 12:19:26.232591	2025-06-06 12:19:26.232591	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\ammo\\\\OPC_Mag_DMR.dds"]	MyObjectBuilder_AmmoMagazine/OPC_DMR_Ammo_Mag13_dummy
393	OPC DMR 7.65x75 magazine	1	OPC DMR 7.65x75 magazine	Ammo	2025-06-06 12:19:26.235775	2025-06-06 12:19:26.235775	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\ammo\\\\OPC_Mag_DMR.dds"]	MyObjectBuilder_AmmoMagazine/OPC_DMR_Ammo_Mag13
394	OPC Andraste 30rd dummy	1	\N	Ammo	2025-06-06 12:19:26.238907	2025-06-06 12:19:26.238907	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\ammo\\\\OPC_Mag_Rifle.dds"]	MyObjectBuilder_AmmoMagazine/OPC_Rifle_Ammo_Mag30_dummy
395	OPC Rifle 6.13x46 magazine	1	OPC Rifle 6.13x46 magazine	Ammo	2025-06-06 12:19:26.242159	2025-06-06 12:19:26.242159	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\ammo\\\\OPC_Mag_Rifle.dds"]	MyObjectBuilder_AmmoMagazine/OPC_Rifle_Ammo_Mag30
396	OPC Erra 40rd dummy	1	\N	Ammo	2025-06-06 12:19:26.245282	2025-06-06 12:19:26.245282	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\ammo\\\\OPC_Mag_SMG.dds"]	MyObjectBuilder_AmmoMagazine/OPC_SMG_Ammo_Mag40_dummy
397	OPC SMG 5.39x13 magazine	1	OPC SMG 5.39x13 magazine	Ammo	2025-06-06 12:19:26.248382	2025-06-06 12:19:26.248382	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\ammo\\\\OPC_Mag_SMG.dds"]	MyObjectBuilder_AmmoMagazine/OPC_SMG_Ammo_Mag40
398	OPC Ophois 17rd dummy	1	\N	Ammo	2025-06-06 12:19:26.251854	2025-06-06 12:19:26.251854	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\ammo\\\\OPC_Mag_Pistol.dds"]	MyObjectBuilder_AmmoMagazine/OPC_Pistol_Ammo_Mag17_dummy
399	OPC Pistol 5.39x13 magazine	1	OPC Pistol 5.39x13 magazine	Ammo	2025-06-06 12:19:26.254881	2025-06-06 12:19:26.254881	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\ammo\\\\OPC_Mag_Pistol.dds"]	MyObjectBuilder_AmmoMagazine/OPC_Pistol_Ammo_Mag17
400	OPC Kirrum Missile S0 dummy	1	\N	Ammo	2025-06-06 12:19:26.258024	2025-06-06 12:19:26.258024	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\ammo\\\\MSL_HEAT_011x1_Magazine.dds"]	MyObjectBuilder_AmmoMagazine/Missile_S0_Mag_dummy
401	FH65 "Perun" Signature DMR	1	\r\n\t\t\tConsolidation's Kinetic DMR\r\n\t\t\tAmmo: OPC DMR 7.65x75 magazine\r\n\t\t\tDistance max: 1250 meters\r\n\t\t	Component	2025-06-06 12:19:26.2618	2025-06-06 12:19:26.2618	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_DMR_opc.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_DMR1_item
402	FH65 "Perun" Glacier DMR	1	\r\n\t\t\tConsolidation's Kinetic DMR\r\n\t\t\tAmmo: OPC DMR 7.65x75 magazine\r\n\t\t\tDistance max: 1250 meters\r\n\t\t	Component	2025-06-06 12:19:26.265063	2025-06-06 12:19:26.265063	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_DMR_white.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_DMR2_item
403	FH65 "Perun" Umbra DMR	1	\r\n\t\t\tConsolidation's Kinetic DMR\r\n\t\t\tAmmo: OPC DMR 7.65x75 magazine\r\n\t\t\tDistance max: 1250 meters\r\n\t\t	Component	2025-06-06 12:19:26.268743	2025-06-06 12:19:26.268743	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_DMR_black.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_DMR3_item
407	FH13 "Ophois" Umbra Pistol	1	\r\n\t\t\tConsolidation's Kinetic pistol\r\n\t\t\tAmmo: OPC Pistol 5.39x13 magazine\r\n\t\t\tDistance max: 300 meters\r\n\t\t	Component	2025-06-06 12:19:26.281475	2025-06-06 12:19:26.281475	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_Pistol_black.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_Pistol3_item
408	FH13 "Ophois" Arbor Pistol	1	\r\n\t\t\tConsolidation's Kinetic pistol\r\n\t\t\tAmmo: OPC Pistol 5.39x13 magazine\r\n\t\t\tDistance max: 300 meters\r\n\t\t	Component	2025-06-06 12:19:26.284598	2025-06-06 12:19:26.284598	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_Pistol_green.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_Pistol4_item
409	FH96 "Astarte" Signature Plasma Cannon	1	\r\n\t\t\tConsolidation's Plasma cannon\r\n\t\t\tAmmo: OPC Plasma Cannon cell\r\n\t\t\tDistance max: 2000 meters\r\n\t\t	Component	2025-06-06 12:19:26.287741	2025-06-06 12:19:26.287741	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_Handheld_Plasma_opc.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_HandheldPlasma1_Item
410	FH96 "Astarte" Glacier Plasma Cannon	1	\r\n\t\t\tConsolidation's Plasma cannon\r\n\t\t\tAmmo: OPC Plasma Cannon cell\r\n\t\t\tDistance max: 2000 meters\r\n\t\t	Component	2025-06-06 12:19:26.291663	2025-06-06 12:19:26.291663	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_Handheld_Plasma_white.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_HandheldPlasma2_Item
411	FH96 "Astarte" Umbra Plasma Cannon	1	\r\n\t\t\tConsolidation's Plasma cannon\r\n\t\t\tAmmo: OPC Plasma Cannon cell\r\n\t\t\tDistance max: 2000 meters\r\n\t\t	Component	2025-06-06 12:19:26.294795	2025-06-06 12:19:26.294795	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_Handheld_Plasma_black.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_HandheldPlasma3_Item
412	FH96 "Astarte" Arbor Plasma Cannon	1	\r\n\t\t\tConsolidation's Plasma cannon\r\n\t\t\tAmmo: OPC Plasma Cannon cell\r\n\t\t\tDistance max: 2000 meters\r\n\t\t	Component	2025-06-06 12:19:26.297781	2025-06-06 12:19:26.297781	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_Handheld_Plasma_green.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_HandheldPlasma4_Item
413	FH57 "Andraste" Signature Rifle	1	\r\n\t\t\tConsolidation's Kinetic rifle\r\n\t\t\tAmmo: OPC Rifle 6.13x46 magazine\r\n\t\t\tDistance max: 800 meters\r\n\t\t	Component	2025-06-06 12:19:26.300734	2025-06-06 12:19:26.300734	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_Rifle_opc.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_Rifle1_item
414	FH57 "Andraste" Glacier Rifle	1	\r\n\t\t\tConsolidation's Kinetic rifle\r\n\t\t\tAmmo: OPC Rifle 6.13x46 magazine\r\n\t\t\tDistance max: 800 meters\r\n\t\t	Component	2025-06-06 12:19:26.303652	2025-06-06 12:19:26.303652	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_Rifle_white.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_Rifle2_item
415	FH57 "Andraste" Umbra Rifle	1	\r\n\t\t\tConsolidation's Kinetic rifle\r\n\t\t\tAmmo: OPC Rifle 6.13x46 magazine\r\n\t\t\tDistance max: 800 meters\r\n\t\t	Component	2025-06-06 12:19:26.306762	2025-06-06 12:19:26.306762	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_Rifle_black.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_Rifle3_item
416	FH57 "Andraste" Arbor Rifle	1	\r\n\t\t\tConsolidation's Kinetic rifle\r\n\t\t\tAmmo: OPC Rifle 6.13x46 magazine\r\n\t\t\tDistance max: 800 meters\r\n\t\t	Component	2025-06-06 12:19:26.309867	2025-06-06 12:19:26.309867	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_Rifle_green.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_Rifle4_item
417	FH36 "Erra" Signature SMG	1	\r\n\t\t\tConsolidation's Kinetic SMG\r\n\t\t\tAmmo: OPC SMG 5.39x13 magazine\r\n\t\t\tDistance max: 300 meters\r\n\t\t	Component	2025-06-06 12:19:26.312991	2025-06-06 12:19:26.312991	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_SMG_opc.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_SMG1_item
418	FH36 "Erra" Glacier SMG	1	\r\n\t\t\tConsolidation's Kinetic SMG\r\n\t\t\tAmmo: OPC SMG 5.39x13 magazine\r\n\t\t\tDistance max: 300 meters\r\n\t\t	Component	2025-06-06 12:19:26.316	2025-06-06 12:19:26.316	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_SMG_white.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_SMG2_item
419	FH36 "Erra" Umbra SMG	1	\r\n\t\t\tConsolidation's Kinetic SMG\r\n\t\t\tAmmo: OPC SMG 5.39x13 magazine\r\n\t\t\tDistance max: 300 meters\r\n\t\t	Component	2025-06-06 12:19:26.319039	2025-06-06 12:19:26.319039	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_SMG_black.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_SMG3_item
420	FH36 "Erra" Arbor SMG	1	\r\n\t\t\tConsolidation's Kinetic SMG\r\n\t\t\tAmmo: OPC SMG 5.39x13 magazine\r\n\t\t\tDistance max: 300 meters\r\n\t\t	Component	2025-06-06 12:19:26.322154	2025-06-06 12:19:26.322154	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_SMG_green.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_SMG4_item
421	FH84 "Kirrum" Signature Missile Launcher	1	\r\n\t\t\tConsolidation's S0 Missile launcher\r\n\t\t\tAmmo: OPC S0 "Mars" missile x1\r\n\t\t\tDistance max: 3000 meters\r\n\t\t	Component	2025-06-06 12:19:26.325928	2025-06-06 12:19:26.325928	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_Missile_Launcher_opc.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_HandheldMissile1_Item
422	FH84 "Kirrum" Glacier Missile Launcher	1	\r\n\t\t\tConsolidation's S0 Missile launcher\r\n\t\t\tAmmo: OPC S0 "Mars" missile x1\r\n\t\t\tDistance max: 3000 meters\r\n\t\t	Component	2025-06-06 12:19:26.329309	2025-06-06 12:19:26.329309	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_Missile_Launcher_white.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_HandheldMissile2_Item
423	FH84 "Kirrum" Umbra Missile Launcher	1	\r\n\t\t\tConsolidation's S0 Missile launcher\r\n\t\t\tAmmo: OPC S0 "Mars" missile x1\r\n\t\t\tDistance max: 3000 meters\r\n\t\t	Component	2025-06-06 12:19:26.332437	2025-06-06 12:19:26.332437	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_Missile_Launcher_black.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_HandheldMissile3_Item
424	FH84 "Kirrum" Arbor Missile Launcher	1	\r\n\t\t\tConsolidation's S0 Missile launcher\r\n\t\t\tAmmo: OPC S0 "Mars" missile x1\r\n\t\t\tDistance max: 3000 meters\r\n\t\t	Component	2025-06-06 12:19:26.336279	2025-06-06 12:19:26.336279	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3385958450\\\\Textures\\\\GUI\\\\Icons\\\\Weapons\\\\OPC_Missile_Launcher_green.dds"]	MyObjectBuilder_PhysicalGunObject/OPC_HandheldMissile4_Item
425	OPC TBC101 Shell	1	Armor-piercing shell for TBC101	Ammo	2025-06-06 12:19:26.339749	2025-06-06 12:19:26.339749	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3383476607\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\TBC101_Blank_Magazine.dds"]	MyObjectBuilder_AmmoMagazine/TBC101_Blank_Magazine
426	OPC TBC202 Shell	1	Armor-piercing shell for TBC202	Ammo	2025-06-06 12:19:26.342884	2025-06-06 12:19:26.342884	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3383476607\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\TBC202_Blank_Magazine.dds"]	MyObjectBuilder_AmmoMagazine/TBC202_Blank_Magazine
427	OPC TBC101 Enhanced Shell	1	Armor-piercing enhanced shell for TBC101	Ammo	2025-06-06 12:19:26.345856	2025-06-06 12:19:26.345856	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3383476607\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\TBC101_Blank_Magazine.dds"]	MyObjectBuilder_AmmoMagazine/TBC101_Blank_Magazine_Elite
428	OPC TBC202 Enhanced Shell	1	Armor-piercing enhanced shell for TBC202	Ammo	2025-06-06 12:19:26.349002	2025-06-06 12:19:26.349002	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3383476607\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\TBC202_Blank_Magazine.dds"]	MyObjectBuilder_AmmoMagazine/TBC202_Blank_Magazine_Elite
429	OPC FBC101 APFSDS Round	1	Armor-piercing shell for FBC101, has small exposion radius, but high penetration	Ammo	2025-06-06 12:19:26.352209	2025-06-06 12:19:26.352209	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3383476607\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\FBC101_Shell_APFSDS.dds"]	MyObjectBuilder_AmmoMagazine/FBC101_Shell_APFSDS
430	OPC TBC404 AP round	1	Armor-piercing standard round for TBC404	Ammo	2025-06-06 12:19:26.355384	2025-06-06 12:19:26.355384	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3383476607\\\\Textures\\\\GUI\\\\Icons\\\\ammo\\\\TBC404_Shell.dds"]	MyObjectBuilder_AmmoMagazine/TBC404_Round
431	OPC TBR202 AP Drum	1	Standard drum with 6 armor-piercing rounds for TBR202	Ammo	2025-06-06 12:19:26.358682	2025-06-06 12:19:26.358682	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3383476607\\\\Textures\\\\GUI\\\\Icons\\\\ammo\\\\TBR202_Magazine.dds"]	MyObjectBuilder_AmmoMagazine/TBR202_Round
432	OPC BMG Belt Magazine	1	Standard machinegun OPC belt for Brauning round	Ammo	2025-06-06 12:19:26.362062	2025-06-06 12:19:26.362062	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3383476607\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\TBG101_50_BMG_Magazine.dds"]	MyObjectBuilder_AmmoMagazine/TBG101_50_BMG_Magazine
433	OPC APBC-T Chaingun Magazine	1	Standard high calibre OPC belt with armor piercing rounds for autocannons	Ammo	2025-06-06 12:19:26.366395	2025-06-06 12:19:26.366395	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3383476607\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\TBR102_APBC_T_Magazine.dds"]	MyObjectBuilder_AmmoMagazine/TBR102_APBC_T_Magazine
434	OPC HE-T Chaingun Magazine	1	Standard high calibre OPC belt with high-eplosive rounds for autocannons	Ammo	2025-06-06 12:19:26.369686	2025-06-06 12:19:26.369686	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3383476607\\\\Textures\\\\GUI\\\\Icons\\\\ammo\\\\TBR102_APBC_T_Magazine.dds"]	MyObjectBuilder_AmmoMagazine/TBR102_HE_T_Magazine
435	OPC FBC101 HESH Round	1	High-explosive shell for TBC101, has low damage to armor and blocks, but high explosion radius	Ammo	2025-06-06 12:19:26.372937	2025-06-06 12:19:26.372937	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3383476607\\\\Textures\\\\GUI\\\\Icons\\\\ammo\\\\FBC101_Shell_HESH.dds"]	MyObjectBuilder_AmmoMagazine/FBC101_Shell_HESH
436	CET Secret Tech	1	\N	Component	2025-06-06 12:19:26.376332	2025-06-06 12:19:26.376332	[null]	MyObjectBuilder_Component/OPC_SecretTech
437	Plushie™ by Consolidation	1	\N	Component	2025-06-06 12:19:26.379866	2025-06-06 12:19:26.379866	[null]	MyObjectBuilder_Component/OPC_Plushie
438	35mm Hybrid Decoy Charge	1	\N	Ammo	2025-06-06 12:19:26.382883	2025-06-06 12:19:26.382883	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\Ace_Ammunition_35mmFlare.dds","D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Cubes\\\\Insignia\\\\Sovus.png"]	MyObjectBuilder_AmmoMagazine/Ace_Ammunition_35mmFlare
439	190mm Hybrid Decoy Charge	1	\N	Ammo	2025-06-06 12:19:26.385864	2025-06-06 12:19:26.385864	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\Ace_Ammunition_190mmFlare.dds","D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Cubes\\\\Insignia\\\\Sovus.png"]	MyObjectBuilder_AmmoMagazine/Ace_Ammunition_190mmFlare
440	20x110mm Ammo Box	1	\N	Ammo	2025-06-06 12:19:26.389068	2025-06-06 12:19:26.389068	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\Ace_Ammunition_20x110mmAmmoBox.png","D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Cubes\\\\Insignia\\\\Sovus.png"]	MyObjectBuilder_AmmoMagazine/Ace_20x110mmAmmoBox
441	30x145mm Ammo Box	1	\N	Ammo	2025-06-06 12:19:26.39234	2025-06-06 12:19:26.39234	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\30mmAmmoBox_Icon.png","D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Cubes\\\\Insignia\\\\Sovus.png"]	MyObjectBuilder_AmmoMagazine/Ace_30x145mmAmmoBox
442	43x307mm Ammo Box	1	\N	Ammo	2025-06-06 12:19:26.395683	2025-06-06 12:19:26.395683	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\Ace_Ammunition_43x307mmAmmoBox.png","D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Cubes\\\\Insignia\\\\Sovus.png"]	MyObjectBuilder_AmmoMagazine/Ace_43x307mmAmmoBox
443	60x470mm Ammo Drum	1	\N	Ammo	2025-06-06 12:19:26.398732	2025-06-06 12:19:26.398732	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\Ace_Ammunition_60x470mmAmmoBox.dds","D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Cubes\\\\Insignia\\\\Sovus.png"]	MyObjectBuilder_AmmoMagazine/Ace_60x470mmAmmoBox
444	80x455mm Magazine	1	\N	Ammo	2025-06-06 12:19:26.401686	2025-06-06 12:19:26.401686	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\Ace_Ammunition_80mmMagazine.dds","D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Cubes\\\\Insignia\\\\Sovus.png"]	MyObjectBuilder_AmmoMagazine/Ace_80mmMagazine
445	100mm Missile	1	\N	Ammo	2025-06-06 12:19:26.404704	2025-06-06 12:19:26.404704	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\Ace_Ammunition_100mmRocket.dds","D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Cubes\\\\Insignia\\\\Sovus.png"]	MyObjectBuilder_AmmoMagazine/Ace_100mmRocket
446	150x550mm Shell	1	\N	Ammo	2025-06-06 12:19:26.407774	2025-06-06 12:19:26.407774	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\Ace_Ammunition_150mmShell.png","D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Cubes\\\\Insignia\\\\Sovus.png"]	MyObjectBuilder_AmmoMagazine/Ace_150mmShell
447	Breakshot Shell	1	\N	Ammo	2025-06-06 12:19:26.411183	2025-06-06 12:19:26.411183	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\Ace_Ammunition_BreakshotShell.dds","D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Cubes\\\\Insignia\\\\Sovus.png"]	MyObjectBuilder_AmmoMagazine/Ace_BreakshotShell
448	220mm Burst Missile	1	\N	Ammo	2025-06-06 12:19:26.414309	2025-06-06 12:19:26.414309	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\220mmBurstMissile_Icon.png","D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Cubes\\\\Insignia\\\\Sovus.png"]	MyObjectBuilder_AmmoMagazine/Ace_220mmBurstMissile
449	300x1100mm Shell	1	\N	Ammo	2025-06-06 12:19:26.418683	2025-06-06 12:19:26.418683	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\Ace_Ammunition_300mmShell.png","D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Cubes\\\\Insignia\\\\Sovus.png"]	MyObjectBuilder_AmmoMagazine/Ace_300mmShell
450	400mm HE Shell	1	\N	Ammo	2025-06-06 12:19:26.42184	2025-06-06 12:19:26.42184	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\Ace_Ammunition_400mmShellFlight.png","D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Cubes\\\\Insignia\\\\Sovus.png"]	MyObjectBuilder_AmmoMagazine/Ace_400mmShell
451	640mm HE Shell	1	\N	Ammo	2025-06-06 12:19:26.425327	2025-06-06 12:19:26.425327	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\Ace_Ammunition_640mmShellFlight.dds","D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Cubes\\\\Insignia\\\\Sovus.png"]	MyObjectBuilder_AmmoMagazine/Ace_640mmShell
452	800mm Strike Torpedo	1	\N	Ammo	2025-06-06 12:19:26.428407	2025-06-06 12:19:26.428407	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\Ace_Ammunition_800mmTorpedoStrike.png","D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Cubes\\\\Insignia\\\\Sovus.png"]	MyObjectBuilder_AmmoMagazine/Ace_800mmTorpedoStrike
453	1000mm HE Shell	1	\N	Ammo	2025-06-06 12:19:26.431468	2025-06-06 12:19:26.431468	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\Ace_Ammunition_1000mmShellFlight.png","D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Cubes\\\\Insignia\\\\Sovus.png"]	MyObjectBuilder_AmmoMagazine/Ace_1000mmShell
454	1500mm HE Shell	1	\N	Ammo	2025-06-06 12:19:26.434695	2025-06-06 12:19:26.434695	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\Ace_Ammunition_1500mmShellFlight.png","D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Cubes\\\\Insignia\\\\Sovus.png"]	MyObjectBuilder_AmmoMagazine/Ace_1500mmShell
455	Folding Chair	1	\N	Ammo	2025-06-06 12:19:26.437709	2025-06-06 12:19:26.437709	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\FoldingChair_Icon.png","D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Cubes\\\\Insignia\\\\Sovus.png"]	MyObjectBuilder_AmmoMagazine/Ace_BadIdea1
456	280-Pound Cannon Ball	1	\N	Ammo	2025-06-06 12:19:26.441352	2025-06-06 12:19:26.441352	["D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Ammo\\\\Ace_YarHarr.dds","D:\\\\Server\\\\Space_Engineers\\\\Center\\\\Instance\\\\content\\\\244850\\\\3361518466\\\\Textures\\\\GUI\\\\Icons\\\\Cubes\\\\Insignia\\\\Sovus.png"]	MyObjectBuilder_AmmoMagazine/Ace_YarHarrBall
457	Assult_Weapon_Frame	1	\N	Component	2025-06-06 12:19:26.444332	2025-06-06 12:19:26.444332	[null]	MyObjectBuilder_Component/AssultWeaponFrame
\.


--
-- Data for Name: marketplace_items; Type: TABLE DATA; Schema: spaceengineers; Owner: -
--

COPY spaceengineers.marketplace_items (id, seller_steam_id, item_name, price, quantity, created_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: spaceengineers; Owner: -
--

COPY spaceengineers.migrations (id, "timestamp", name) FROM stdin;
1	250322010100	CreateUsersTable20250322010100
2	250322010200	CreateItemsTable20250322010200
3	250322020300	CreateOnlineStorageTable20250322020300
4	250322020400	CreateMarketplaceItemsTable20250322020400
5	250329000100	CreateWalletsAndCurrenciesTables20250329000100
6	250329000200	AddIconsColumnToItemsTable20250329000200
7	250329000300	AddIndexNameColumnToItemsTable20250329000300
8	250329000400	RenameNameToDisplayNameInItemsTable20250329000400
9	250329000500	SetDefaultValueForRarityInItemsTable20250329000500
10	250329000600	RefactorOnlineStorageTable20250329000600
11	250413000100	UpdateOnlineStorageIdToBigInt20250413000100
12	250413000200	SetDefaultSteamIdInOnlineStorage20250413000200
13	250413000300	AlterStorageAndItemIdToBigInt20250413000300
14	250414000100	AddScoreColumnToUsersTable20250414000100
15	250414000200	AlterScoreColumnToFloat20250414000200
25	250629000040	AddPrimaryKeyToCurrenciesTable20250629000040
26	250629000050	AddPrimaryKeyToUsersTable20250629000050
27	250629000100	CreateGamesAndServersTable20250629000100
28	250629000200	UpdateCurrenciesTable20250629000200
29	250629000300	UpdateWalletsTable20250629000300
30	250629000400	InsertInitialGameData20250629000400
31	250629000500	MigrateExistingWalletData20250629000500
\.


--
-- Data for Name: online_storage; Type: TABLE DATA; Schema: spaceengineers; Owner: -
--

COPY spaceengineers.online_storage (id, steam_id) FROM stdin;
1	76561198267339203
82	76561197981957072
11	76561198009668693
10	76561199503614150
2	76561199094382492
83	76561198014755585
77	76561198178234613
5	76561198047250119
85	76561198304598033
78	76561198015369549
8	76561198018053515
80	76561199055671502
76	76561198107144287
81	76561198120427773
79	76561198015453217
59	76561198315901967
84	76561197967883859
6	76561198088523681
16	76561198120505856
4	76561198801528765
44	76561198009735778
86	76561198445703207
45	76561198215165007
75	76561198881509038
3	76561198062328352
87	76561198021403260
9	76561198076031211
88	76561198098426469
7	76561197993575589
\.


--
-- Data for Name: online_storage_items; Type: TABLE DATA; Schema: spaceengineers; Owner: -
--

COPY spaceengineers.online_storage_items (id, storage_id, item_id, quantity) FROM stdin;
6	1	10	20
7	1	11	20
8	1	12	20
9	1	13	20
10	1	14	20
11	1	15	20
12	1	16	20
13	1	17	20
14	1	18	20
15	1	19	20
16	1	20	20
17	1	21	20
18	1	22	20
19	1	23	20
20	1	24	20
21	1	25	20
22	1	26	20
23	1	27	20
24	1	28	20
25	1	29	20
26	1	30	20
27	1	31	20
28	1	32	20
29	1	33	20
30	1	34	20
31	1	35	20
32	1	36	20
33	1	37	20
34	1	38	20
35	1	39	20
36	1	40	20
37	1	41	20
38	1	42	20
39	1	43	20
40	1	44	20
41	1	45	20
42	1	46	20
43	1	47	20
44	1	48	20
45	1	49	20
46	1	50	20
47	1	51	20
48	1	52	20
49	1	53	20
50	1	54	20
51	1	55	20
52	1	56	20
53	1	57	20
54	1	58	20
55	1	59	20
56	1	60	20
57	1	61	20
58	1	62	20
59	1	63	20
60	1	64	20
61	1	65	20
62	1	66	20
63	1	67	20
64	1	68	20
65	1	69	20
66	1	70	20
67	1	71	20
68	1	72	20
69	1	73	20
70	1	74	20
71	1	75	20
72	1	76	20
73	1	77	20
74	1	78	20
75	1	79	20
76	1	80	20
77	1	81	20
78	1	82	20
79	1	83	20
80	1	84	20
81	1	85	20
82	1	86	20
83	1	87	20
84	1	88	20
85	1	89	20
86	1	90	20
87	1	91	20
88	1	92	20
89	1	93	20
90	1	94	20
91	1	95	20
92	1	96	20
93	1	97	20
94	1	98	20
95	1	99	20
96	1	100	20
97	1	101	10
98	1	102	10
99	1	103	10
101	1	105	10
102	1	106	10
103	1	107	10
104	1	108	10
105	1	109	10
126	1	130	10
127	1	131	10
128	1	132	10
5	1	9	5
130	1	134	10
131	1	135	10
132	1	136	10
133	1	137	10
134	1	138	10
135	1	139	10
136	1	140	10
137	1	141	10
138	1	142	10
139	1	143	10
140	1	144	10
141	1	145	10
142	1	146	10
143	1	147	10
144	1	148	10
145	1	149	10
146	1	150	10
147	1	151	10
148	1	152	10
149	1	153	10
150	1	154	10
151	1	155	10
152	1	156	10
153	1	157	10
154	1	158	10
155	1	159	10
156	1	160	10
157	1	161	10
158	1	162	10
159	1	163	10
160	1	164	10
161	1	165	10
162	1	166	10
163	1	167	10
164	1	168	10
165	1	169	10
166	1	170	10
167	1	171	10
168	1	172	10
169	1	173	10
170	1	174	10
171	1	175	10
172	1	176	10
173	1	177	10
174	1	178	10
175	1	179	10
176	1	180	10
177	1	181	10
178	1	182	10
179	1	183	10
180	1	184	10
181	1	185	10
182	1	186	10
183	1	187	10
184	1	188	10
185	1	189	10
186	1	190	10
187	1	191	10
188	1	192	10
189	1	193	10
190	1	194	10
191	1	195	10
192	1	196	10
193	1	197	10
194	1	198	10
195	1	199	29
199	82	199	20
200	11	199	20
201	10	199	20
202	2	199	20
203	83	199	20
204	77	199	20
205	5	199	20
206	85	199	20
207	78	199	20
209	80	199	20
210	76	199	20
211	81	199	20
212	79	199	20
213	59	199	20
214	84	199	20
215	6	199	20
216	16	199	20
218	44	199	20
219	86	199	20
220	45	199	20
221	75	199	20
224	9	199	20
225	88	199	20
208	8	199	0
375	8	165	0
376	8	166	0
372	8	175	0
374	8	176	0
377	8	185	0
378	8	186	0
222	3	199	0
226	7	199	0
223	87	199	0
217	4	199	0
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: spaceengineers; Owner: -
--

COPY spaceengineers.users (id, username, email, password, steam_id, created_at, updated_at, score) FROM stdin;
5	SuperCore_X3	\N	\N	76561198047250119	2025-05-05 09:31:04.672832	2025-05-18 09:35:16.485	0
16	BFLY	\N	\N	76561198120505856	2025-05-06 13:32:57.853	2025-05-06 13:32:57.853	0
45	op206	\N	\N	76561198215165007	2025-05-06 06:02:45.2021	2025-05-25 09:50:42.671	59.99999865889549
79	- T0b!aS -	\N	\N	76561198015453217	2025-05-15 12:48:01.058	2025-05-15 12:48:01.058	0
83	ABCO	\N	\N	76561198014755585	2025-05-17 11:46:26.501	2025-06-03 07:23:00.087	0
99	Azaleus Arcane	\N	\N	76561198818086708	2025-06-16 05:49:15.717	2025-06-16 05:49:15.717	0
1	qwas	\N	\N	76561198267339203	2025-05-05 06:09:17.500529	2025-06-22 12:52:12.918	33
11	silverclover	\N	\N	76561198009668693	2025-05-05 16:44:28.131594	2025-05-25 11:18:12.523	31.449033737182617
87	Bibari	\N	\N	76561198021403260	2025-05-24 09:17:33.573	2025-06-05 10:41:28.623	2.7599999383091927
44	yungoon	\N	\N	76561198009735778	2025-05-05 18:32:22.597911	2025-06-22 13:28:44.348	74340.64024958014
6	Nihilistic	\N	\N	76561198088523681	2025-05-05 12:04:51.108775	2025-05-13 16:00:01.865	188.20000886917114
100	Korsar	\N	\N	76561198032880728	2025-06-24 04:52:27.808	2025-06-24 04:52:27.808	0
94	DroneSensor	\N	\N	76561198244872174	2025-06-03 16:31:08.583	2025-06-18 09:03:13.335	3756.314581692219
59	tottenham96	\N	\N	76561198315901967	2025-05-10 15:52:25.056	2025-05-10 15:52:25.056	0
90	하야만	\N	\N	76561198890072231	2025-05-31 04:18:29.361	2025-06-01 03:02:49.522	0.24166666250675917
86	071	\N	\N	76561198445703207	2025-05-22 12:12:06.795	2025-05-22 12:12:06.795	0
8	Cuc Thit	\N	\N	76561198018053515	2025-05-05 15:02:41.228949	2025-06-14 03:41:33.118	17391.013344516978
98	StoicGuard	\N	\N	76561198067738546	2025-06-12 04:56:17.068	2025-06-12 09:02:19.113	0
84	Arstraea	\N	\N	76561197967883859	2025-05-21 12:58:13.741	2025-06-09 11:55:05.826	0
81	Humi	\N	\N	76561198120427773	2025-05-16 09:56:07.397	2025-05-16 09:56:07.397	0
77	WTF_Luigi	\N	\N	76561198178234613	2025-05-14 13:52:12.717	2025-05-30 12:55:14.114	0
96	maro	\N	\N	76561198119949135	2025-06-07 10:48:21.346	2025-06-07 10:48:21.346	0
88	BamBoo-Buds	\N	\N	76561198098426469	2025-05-26 19:35:25.926	2025-06-10 02:40:39.295	177
80	ALyCE	\N	\N	76561199055671502	2025-05-15 14:38:57.869	2025-05-22 13:36:38.883	155.35183107480407
3	cookmedic	\N	\N	76561198062328352	2025-05-05 08:18:46.327645	2025-06-25 11:09:09.285	3475.139200612437
85	爵士	\N	\N	76561198304598033	2025-05-22 11:17:02.92	2025-05-22 11:17:02.92	0
4	Naz	\N	\N	76561198801528765	2025-05-05 09:17:30.849029	2025-06-19 15:26:44.104	56938.00589194801
9	objbo	\N	\N	76561198076031211	2025-05-05 15:04:15.459471	2025-06-20 02:51:10.421	4519.646543413401
93	Lemon Cider	\N	\N	76561198056409198	2025-06-03 13:02:13.21	2025-06-11 15:03:14.016	84.40305137634277
91	Kid_Rin	\N	\N	76561198337432296	2025-05-31 13:20:33.562	2025-06-02 01:28:28.817	0
7	SerGuay	\N	\N	76561197993575589	2025-05-05 14:38:35.858055	2025-06-26 11:57:05.694	13971.15902929008
10	WTF_Parasyte	\N	\N	76561199503614150	2025-05-05 15:53:59.790965	2025-05-16 16:56:01.347	0
82	Volg	\N	\N	76561197981957072	2025-05-16 21:22:49.058	2025-05-16 21:22:49.058	0
76	Maurus	\N	\N	76561198107144287	2025-05-14 13:51:48.143	2025-06-26 13:10:44.23	21450.36504616216
101	canmore	\N	\N	76561198150634240	2025-06-25 09:23:07.351	2025-06-27 05:35:08.492	0
95	NyaNyaNyang	\N	\N	76561198058835491	2025-06-04 04:25:04.337	2025-06-27 10:06:41.118	0
97	lastsamurai	\N	\N	76561197999644014	2025-06-08 09:15:09.359	2025-06-08 09:15:09.359	0
78	EVESOL	\N	\N	76561198015369549	2025-05-14 14:37:54.807	2025-06-27 16:14:20.245	0.8399999737739563
2	修羅道	\N	\N	76561199094382492	2025-05-05 07:43:25.297765	2025-06-10 14:00:57.134	8280.260053584818
75	[WTF]-2_GENERALS	\N	\N	76561198881509038	2025-05-13 15:04:14.667	2025-05-30 09:24:49.958	0
89	algajely	\N	\N	76561198168241422	2025-05-30 15:51:07.314	2025-05-31 15:26:09.572	0
92	泠汐	\N	\N	76561198446796447	2025-06-01 10:07:46.902	2025-06-01 10:17:13.095	0
\.


--
-- Data for Name: wallet_transactions; Type: TABLE DATA; Schema: spaceengineers; Owner: -
--

COPY spaceengineers.wallet_transactions (id, wallet_id, user_id, transaction_type, amount, balance_before, balance_after, description, reference_id, status, metadata, created_at, updated_at) FROM stdin;
1	1	1	DEPOSIT	100.50000000	0.00000000	100.50000000	Initial deposit for testing	\N	COMPLETED	{"source":"test"}	2025-06-29 11:21:58.853785	2025-06-29 11:21:58.853785
\.


--
-- Data for Name: wallets; Type: TABLE DATA; Schema: spaceengineers; Owner: -
--

COPY spaceengineers.wallets (id, user_id, game_id, server_id, currency_id, balance, locked_balance, is_active, metadata, created_at, updated_at) FROM stdin;
1	1	1	1	15	100.50000000	0.00000000	t	\N	2025-06-29 11:21:37.494183	2025-06-29 11:21:58.853785
2	1	1	2	16	0.00000000	0.00000000	t	\N	2025-06-29 11:22:31.721884	2025-06-29 11:22:31.721884
\.


--
-- Data for Name: wallets_backup_1751195740620; Type: TABLE DATA; Schema: spaceengineers; Owner: -
--

COPY spaceengineers.wallets_backup_1751195740620 (id, user_id, balance, currency_id, created_at, updated_at) FROM stdin;
\.


--
-- Name: currencies_id_seq; Type: SEQUENCE SET; Schema: spaceengineers; Owner: -
--

SELECT pg_catalog.setval('spaceengineers.currencies_id_seq', 21, true);


--
-- Name: game_servers_id_seq; Type: SEQUENCE SET; Schema: spaceengineers; Owner: -
--

SELECT pg_catalog.setval('spaceengineers.game_servers_id_seq', 3, true);


--
-- Name: games_id_seq; Type: SEQUENCE SET; Schema: spaceengineers; Owner: -
--

SELECT pg_catalog.setval('spaceengineers.games_id_seq', 3, true);


--
-- Name: item_download_log_id_seq; Type: SEQUENCE SET; Schema: spaceengineers; Owner: -
--

SELECT pg_catalog.setval('spaceengineers.item_download_log_id_seq', 40, true);


--
-- Name: items_id_seq; Type: SEQUENCE SET; Schema: spaceengineers; Owner: -
--

SELECT pg_catalog.setval('spaceengineers.items_id_seq', 457, true);


--
-- Name: marketplace_items_id_seq; Type: SEQUENCE SET; Schema: spaceengineers; Owner: -
--

SELECT pg_catalog.setval('spaceengineers.marketplace_items_id_seq', 1, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: spaceengineers; Owner: -
--

SELECT pg_catalog.setval('spaceengineers.migrations_id_seq', 31, true);


--
-- Name: online_storage_id_seq; Type: SEQUENCE SET; Schema: spaceengineers; Owner: -
--

SELECT pg_catalog.setval('spaceengineers.online_storage_id_seq', 4, true);


--
-- Name: online_storage_items_id_seq; Type: SEQUENCE SET; Schema: spaceengineers; Owner: -
--

SELECT pg_catalog.setval('spaceengineers.online_storage_items_id_seq', 383, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: spaceengineers; Owner: -
--

SELECT pg_catalog.setval('spaceengineers.users_id_seq', 101, true);


--
-- Name: wallet_transactions_id_seq; Type: SEQUENCE SET; Schema: spaceengineers; Owner: -
--

SELECT pg_catalog.setval('spaceengineers.wallet_transactions_id_seq', 1, true);


--
-- Name: wallets_id_seq; Type: SEQUENCE SET; Schema: spaceengineers; Owner: -
--

SELECT pg_catalog.setval('spaceengineers.wallets_id_seq', 2, true);


--
-- Name: game_servers PK_279043aaec15626fa94878da8a3; Type: CONSTRAINT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.game_servers
    ADD CONSTRAINT "PK_279043aaec15626fa94878da8a3" PRIMARY KEY (id);


--
-- Name: wallet_transactions PK_5120f131bde2cda940ec1a621db; Type: CONSTRAINT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.wallet_transactions
    ADD CONSTRAINT "PK_5120f131bde2cda940ec1a621db" PRIMARY KEY (id);


--
-- Name: wallets PK_8402e5df5a30a229380e83e4f7e; Type: CONSTRAINT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.wallets
    ADD CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY (id);


--
-- Name: games PK_c9b16b62917b5595af982d66337; Type: CONSTRAINT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.games
    ADD CONSTRAINT "PK_c9b16b62917b5595af982d66337" PRIMARY KEY (id);


--
-- Name: games UQ_6048911d5f44406ad25e44eaaed; Type: CONSTRAINT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.games
    ADD CONSTRAINT "UQ_6048911d5f44406ad25e44eaaed" UNIQUE (code);


--
-- Name: currencies currencies_pkey; Type: CONSTRAINT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.currencies
    ADD CONSTRAINT currencies_pkey PRIMARY KEY (id);


--
-- Name: item_download_log item_download_log_pkey; Type: CONSTRAINT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.item_download_log
    ADD CONSTRAINT item_download_log_pkey PRIMARY KEY (id);


--
-- Name: items items_index_name_unique; Type: CONSTRAINT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.items
    ADD CONSTRAINT items_index_name_unique UNIQUE (index_name);


--
-- Name: online_storage_items unique_storage_item; Type: CONSTRAINT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.online_storage_items
    ADD CONSTRAINT unique_storage_item UNIQUE (storage_id, item_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_currencies_game_id; Type: INDEX; Schema: spaceengineers; Owner: -
--

CREATE INDEX "IDX_currencies_game_id" ON spaceengineers.currencies USING btree (game_id);


--
-- Name: IDX_currencies_type; Type: INDEX; Schema: spaceengineers; Owner: -
--

CREATE INDEX "IDX_currencies_type" ON spaceengineers.currencies USING btree (type);


--
-- Name: IDX_game_servers_code; Type: INDEX; Schema: spaceengineers; Owner: -
--

CREATE UNIQUE INDEX "IDX_game_servers_code" ON spaceengineers.game_servers USING btree (game_id, code);


--
-- Name: IDX_game_servers_game_id; Type: INDEX; Schema: spaceengineers; Owner: -
--

CREATE INDEX "IDX_game_servers_game_id" ON spaceengineers.game_servers USING btree (game_id);


--
-- Name: IDX_wallet_transactions_type_created_at; Type: INDEX; Schema: spaceengineers; Owner: -
--

CREATE INDEX "IDX_wallet_transactions_type_created_at" ON spaceengineers.wallet_transactions USING btree (transaction_type, created_at);


--
-- Name: IDX_wallet_transactions_user_id_created_at; Type: INDEX; Schema: spaceengineers; Owner: -
--

CREATE INDEX "IDX_wallet_transactions_user_id_created_at" ON spaceengineers.wallet_transactions USING btree (user_id, created_at);


--
-- Name: IDX_wallet_transactions_wallet_id_created_at; Type: INDEX; Schema: spaceengineers; Owner: -
--

CREATE INDEX "IDX_wallet_transactions_wallet_id_created_at" ON spaceengineers.wallet_transactions USING btree (wallet_id, created_at);


--
-- Name: IDX_wallets_unique_combination; Type: INDEX; Schema: spaceengineers; Owner: -
--

CREATE UNIQUE INDEX "IDX_wallets_unique_combination" ON spaceengineers.wallets USING btree (user_id, game_id, server_id, currency_id);


--
-- Name: wallets FK_177421f143d995e48c2a978e069; Type: FK CONSTRAINT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.wallets
    ADD CONSTRAINT "FK_177421f143d995e48c2a978e069" FOREIGN KEY (game_id) REFERENCES spaceengineers.games(id) ON DELETE CASCADE;


--
-- Name: wallet_transactions FK_4796762c619893704abbc3dce65; Type: FK CONSTRAINT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.wallet_transactions
    ADD CONSTRAINT "FK_4796762c619893704abbc3dce65" FOREIGN KEY (user_id) REFERENCES spaceengineers.users(id) ON DELETE CASCADE;


--
-- Name: game_servers FK_580fc7e0080d61ad92882081282; Type: FK CONSTRAINT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.game_servers
    ADD CONSTRAINT "FK_580fc7e0080d61ad92882081282" FOREIGN KEY (game_id) REFERENCES spaceengineers.games(id) ON DELETE CASCADE;


--
-- Name: wallets FK_66e93d6289a730a2bade3b979a3; Type: FK CONSTRAINT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.wallets
    ADD CONSTRAINT "FK_66e93d6289a730a2bade3b979a3" FOREIGN KEY (server_id) REFERENCES spaceengineers.game_servers(id) ON DELETE CASCADE;


--
-- Name: wallets FK_92558c08091598f7a4439586cda; Type: FK CONSTRAINT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.wallets
    ADD CONSTRAINT "FK_92558c08091598f7a4439586cda" FOREIGN KEY (user_id) REFERENCES spaceengineers.users(id) ON DELETE CASCADE;


--
-- Name: wallets FK_b3167c57663ae949d67436465b3; Type: FK CONSTRAINT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.wallets
    ADD CONSTRAINT "FK_b3167c57663ae949d67436465b3" FOREIGN KEY (currency_id) REFERENCES spaceengineers.currencies(id) ON DELETE RESTRICT;


--
-- Name: currencies FK_bb2a1e2eb0a51d4dded3cf35391; Type: FK CONSTRAINT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.currencies
    ADD CONSTRAINT "FK_bb2a1e2eb0a51d4dded3cf35391" FOREIGN KEY (game_id) REFERENCES spaceengineers.games(id) ON DELETE SET NULL;


--
-- Name: wallet_transactions FK_c57d19129968160f4db28fc8b28; Type: FK CONSTRAINT; Schema: spaceengineers; Owner: -
--

ALTER TABLE ONLY spaceengineers.wallet_transactions
    ADD CONSTRAINT "FK_c57d19129968160f4db28fc8b28" FOREIGN KEY (wallet_id) REFERENCES spaceengineers.wallets(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

