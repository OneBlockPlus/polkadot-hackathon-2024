
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;


CREATE TABLE public.cybor_nft (
    cybor_nft_id character varying(512) NOT NULL,
    cybor_name character varying(100) NOT NULL,
    race_name character varying(100) NOT NULL,
    lvl int,
    grade int,
    created_at timestamp without time zone DEFAULT timezone('UTC'::text, now()) NOT NULL,
    updated_at timestamp without time zone DEFAULT timezone('UTC'::text, now()) NOT NULL,
    deleted_at timestamp without time zone
);

GRANT ALL ON TABLE public.cybor_nft TO cybor;

