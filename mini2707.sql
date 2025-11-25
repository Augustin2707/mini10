-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : ven. 14 nov. 2025 à 07:40
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `mini2707`
--

-- --------------------------------------------------------

--
-- Structure de la table `accounts`
--

CREATE TABLE `accounts` (
  `account_id` int(11) NOT NULL,
  `code` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `accounts`
--

INSERT INTO `accounts` (`account_id`, `code`, `name`) VALUES
(1, '6111', 'Fournitures de Bureau'),
(2, '6113', 'Informatique et Impression'),
(3, '6114', 'Nettoyage et Hygiène');

-- --------------------------------------------------------

--
-- Structure de la table `admin_logs`
--

CREATE TABLE `admin_logs` (
  `log_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `details` text DEFAULT NULL,
  `admin_login` varchar(50) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `motif` text NOT NULL,
  `delivery_comment` text DEFAULT NULL,
  `status` enum('pending','validated','rejected','in_delivery','received') NOT NULL DEFAULT 'pending',
  `motif_rejet` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `date_heure_reception` datetime DEFAULT NULL,
  `date_heure_livraison` datetime DEFAULT NULL,
  `identifiant_utilisateur` varchar(50) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `orders`
--

INSERT INTO `orders` (`order_id`, `user_id`, `product_id`, `quantity`, `motif`, `delivery_comment`, `status`, `motif_rejet`, `created_at`, `date_heure_reception`, `date_heure_livraison`, `identifiant_utilisateur`) VALUES
(1, 4, 101, 10, 'CIR', '', 'received', NULL, '2025-11-14 09:17:19', '2025-11-14 09:30:35', '2025-11-14 09:30:09', 'utl2');

-- --------------------------------------------------------

--
-- Structure de la table `order_actions`
--

CREATE TABLE `order_actions` (
  `action_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action_type` enum('validate','reject','deliver','receive') NOT NULL,
  `action_date` datetime DEFAULT current_timestamp(),
  `auteur_login` varchar(50) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `order_actions`
--

INSERT INTO `order_actions` (`action_id`, `order_id`, `user_id`, `action_type`, `action_date`, `auteur_login`) VALUES
(1, 1, 2, 'validate', '2025-11-14 09:28:58', 'chef1'),
(2, 1, 1, 'deliver', '2025-11-14 09:30:09', 'comptable1'),
(3, 1, 4, 'receive', '2025-11-14 09:30:35', 'utl2');

--
-- Déclencheurs `order_actions`
--
DELIMITER $$
CREATE TRIGGER `after_deliver_update_livraison_date` AFTER INSERT ON `order_actions` FOR EACH ROW BEGIN
    IF NEW.action_type = 'deliver' THEN
        UPDATE orders 
        SET date_heure_livraison = NOW() 
        WHERE order_id = NEW.order_id;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_delivery_update_stock` AFTER INSERT ON `order_actions` FOR EACH ROW BEGIN
    IF NEW.action_type = 'receive' THEN
        UPDATE stock s
        JOIN orders o ON o.order_id = NEW.order_id
        SET s.quantity = s.quantity - o.quantity
        WHERE s.product_id = o.product_id;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_receive_update_reception_date` AFTER INSERT ON `order_actions` FOR EACH ROW BEGIN
    IF NEW.action_type = 'receive' THEN
        UPDATE orders 
        SET date_heure_reception = NOW() 
        WHERE order_id = NEW.order_id;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `products`
--

CREATE TABLE `products` (
  `product_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `unit` varchar(50) DEFAULT 'Pièce',
  `account_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `products`
--

INSERT INTO `products` (`product_id`, `name`, `unit`, `account_id`) VALUES
(1, 'Stylo à bille bleu', 'Pièce', 1),
(2, 'Stylo à bille noir', 'Pièce', 1),
(3, 'Stylo à bille rouge', 'Pièce', 1),
(4, 'Stylo à bille vert', 'Pièce', 1),
(5, 'Stylo pour signature', 'Pièce', 1),
(6, 'Crayon en bois', 'Pièce', 1),
(7, 'Gomme', 'Pièce', 1),
(8, 'Surligneur', 'Pièce', 1),
(9, 'Marqueur permanent noir', 'Pièce', 1),
(10, 'Marqueur permanent multicolor paquet de 4', 'Paquet', 1),
(11, 'Marqueur non permanent noir', 'Pièce', 1),
(12, 'Marqueur non permanent multicolor paquet de 4', 'Paquet', 1),
(13, 'Taille crayon', 'Pièce', 1),
(14, 'Blanco stylo correcteur', 'Pièce', 1),
(15, 'Blanco en flacon', 'Flacon', 1),
(16, 'Cahier 192 pages GF paquet de 5', 'Paquet', 1),
(17, 'Cahier 192 pages PF', 'Pièce', 1),
(18, 'Cahier 96 pages PF', 'Pièce', 1),
(19, 'Cahier GF 96 pages', 'Pièce', 1),
(20, 'Cahier arrivée', 'Pièce', 1),
(21, 'Cahier de registre 200 pages GM', 'Pièce', 1),
(22, 'Cahier de registre arrivée', 'Pièce', 1),
(23, 'Cahier registre de départ', 'Pièce', 1),
(24, 'Cahier de transmission', 'Pièce', 1),
(25, 'Bloc-note GM', 'Pièce', 1),
(26, 'Bloc-note PM', 'Pièce', 1),
(27, 'Bloc cube avec socle', 'Pièce', 1),
(28, 'Recharge papier cube', 'Paquet', 1),
(29, 'Socle bloc éphéméride', 'Pièce', 1),
(30, 'Papier velin A4', 'Rame', 1),
(31, 'Papier pelure', 'Rame', 1),
(32, 'Papier bristol paquet de 100', 'Paquet', 1),
(33, 'Enveloppe blanche C4 Paquet de 100', 'Paquet', 1),
(34, 'Enveloppe blanche 11x12 paquet de 100', 'Paquet', 1),
(35, 'Enveloppe blanche C6 paquet de 100', 'Paquet', 1),
(36, 'Enveloppe Kraft C4 paquet de 100', 'Paquet', 1),
(37, 'Enveloppe Kraft C4 paquet de 50', 'Paquet', 1),
(38, 'Enveloppe Kraft C3 paquet de 100', 'Paquet', 1),
(39, 'Enveloppe Kraft C3 paquet de 50', 'Paquet', 1),
(40, 'Enveloppe Kraft C3 paquet de 25', 'Paquet', 1),
(41, 'Enveloppe Kraft C5 paquet de 100', 'Paquet', 1),
(42, 'Enveloppe Kraft C5 paquet de 50', 'Paquet', 1),
(43, 'Chemise cartonnée', 'Pièce', 1),
(44, 'Chemise à rabats', 'Pièce', 1),
(45, 'Chemise à sangle', 'Pièce', 1),
(46, 'Sous chemise paquet de 250', 'Paquet', 1),
(47, 'Couverture transparente', 'Paquet', 1),
(48, 'Classeur à 40 vues', 'Pièce', 1),
(49, 'Classeur à 60 vues', 'Pièce', 1),
(50, 'Classeur à 100 vues', 'Pièce', 1),
(51, 'Classeur à levier', 'Pièce', 1),
(52, 'Parapheur de 12', 'Pièce', 1),
(53, 'Parapheur de 24', 'Pièce', 1),
(54, 'Boite d\'archives en carton', 'Pièce', 1),
(55, 'Boite d\'archives en plastique', 'Pièce', 1),
(56, 'Bac à courrier simple', 'Pièce', 1),
(57, 'Bac à courrier 2 étages', 'Pièce', 1),
(58, 'Bac à courrier 3 étages', 'Pièce', 1),
(59, 'Sous main', 'Pièce', 1),
(60, 'Porte-stylo', 'Pièce', 1),
(61, 'Conférencier', 'Pièce', 1),
(62, 'Agenda 2025', 'Pièce', 1),
(63, 'Post-it GF', 'Paquet', 1),
(64, 'Post-it carré 75mm*75mm', 'Paquet', 1),
(65, 'Post-it carré 76mm*76mm en papillon', 'Paquet', 1),
(66, 'Post-it mini couleur', 'Paquet', 1),
(67, 'Agrafeuse 24/6', 'Pièce', 1),
(68, 'Agrafe 24/6', 'Boîte', 1),
(69, 'Agrafe 23/15', 'Boîte', 1),
(70, 'Désagrafeuse', 'Pièce', 1),
(71, 'Perforateur GM', 'Pièce', 1),
(72, 'Trombone 33mm', 'Boîte', 1),
(73, 'Trombone 50mm', 'Boîte', 1),
(74, 'Attache lettre GM Boîte de 12', 'Boîte', 1),
(75, 'Attache lettre GM Boîte de 50', 'Boîte', 1),
(76, 'Attache lettre GM Boîte de 100', 'Boîte', 1),
(77, 'Attache lettre PM Boîte de 50', 'Boîte', 1),
(78, 'Punaise', 'Boîte', 1),
(79, 'Colle de bureau en pot', 'Pot', 1),
(80, 'Scotch transparent GM', 'Rouleau', 1),
(81, 'Scotch transparent PM', 'Rouleau', 1),
(82, 'Scotch GM HAVANE', 'Rouleau', 1),
(83, 'Ficelle de bureau', 'Rouleau', 1),
(84, 'Ciseaux de bureau GM', 'Pièce', 1),
(85, 'Ciseaux de bureau PM', 'Pièce', 1),
(86, 'Coupe papier', 'Pièce', 1),
(87, 'Règle de 20 cm', 'Pièce', 1),
(88, 'Règle de 50 cm', 'Pièce', 1),
(89, 'Carbonne à main (bleu)', 'Paquet', 1),
(90, 'Carbonne machine à écrire', 'Paquet', 1),
(91, 'Tampon encreur', 'Pièce', 1),
(92, 'Encre à tampon', 'Flacon', 1),
(93, 'Porte cachet simple', 'Pièce', 1),
(94, 'Porte cachet double', 'Pièce', 1),
(95, 'Dateur', 'Pièce', 1),
(96, 'Porte badge boite de 50 pièces', 'Boîte', 1),
(97, 'Machine calculatrice', 'Pièce', 1),
(98, 'Rouleau pour machine à calculer', 'Rouleau', 1),
(99, 'Ruban machine à calculer bicolore', 'Rouleau', 1),
(100, 'Ruban machine à écrire', 'Rouleau', 1),
(101, 'Clé USB 16 G.O', 'Pièce', 2),
(102, 'Clé USB 32 G.O', 'Pièce', 2),
(103, 'CD 52 X', 'Paquet', 2),
(104, 'Disque CD ROM', 'Pièce', 2),
(105, 'Disque DVD ROM', 'Pièce', 2),
(106, 'Lécteur/graveur externe de disque DVD', 'Pièce', 2),
(107, 'Souris sans fil', 'Pièce', 2),
(108, 'Tapis souris', 'Pièce', 2),
(109, 'Prise multiple', 'Pièce', 2),
(110, 'Pile rechargeable 1,5V paquet de 4', 'Paquet', 2),
(111, 'Chargeur de pile pour AA', 'Pièce', 2),
(112, 'Nettoyant écran ordinateur', 'Bouteille', 2),
(113, 'Bombe nettoyant pour ordi', 'Bombe', 2),
(114, 'Encre HP 21 (noire)', 'Cartouche', 2),
(115, 'Encre HP 22 (couleur)', 'Cartouche', 2),
(116, 'Encre HP 61 N (noire)', 'Cartouche', 2),
(117, 'Encre HP 61 C (Couleur)', 'Cartouche', 2),
(118, 'Encre HP 85 A noire', 'Cartouche', 2),
(119, 'Encre HP 36 A noire pour HP laser jet P 15054', 'Cartouche', 2),
(120, 'Encre toner HP 80 A noire', 'Toner', 2),
(121, 'Encre toner LaserJet Catridge 725', 'Toner', 2),
(122, 'Encre CANON 719', 'Cartouche', 2),
(123, 'Encre CANON PIXMA MP 250 (510 black)', 'Cartouche', 2),
(124, 'Encre 511 couleur CANON PIXMA MP250', 'Cartouche', 2),
(125, 'Encre LEXMARK 17 noire', 'Cartouche', 2),
(126, 'Encre noire pour imprimante multifonction', 'Cartouche', 2),
(127, 'Balai brosse avec manche', 'Pièce', 3),
(128, 'Balai rasta avec sceau plastique GM', 'Pièce', 3),
(129, 'Serpillière GM', 'Pièce', 3),
(130, 'Sceau plastique 5l', 'Pièce', 3),
(131, 'Pelle plastique à ordure', 'Pièce', 3),
(132, 'Brosse nettoyage', 'Pièce', 3),
(133, 'Chiffon jaune paquet de 12 (PM)', 'Paquet', 3),
(134, 'Papier essuie tout', 'Paquet', 3),
(135, 'Papier de toilette paquet de 12', 'Paquet', 3),
(136, 'Paquet toilette paquet de 10', 'Paquet', 3),
(137, 'Eau de javel', 'Bouteille', 3),
(138, 'Lave vitre', 'Bouteille', 3),
(139, 'Lave mains', 'Bouteille', 3),
(140, 'Lave mains molèles (bidon avec robinet)', 'Bidon', 3),
(141, 'Savon en barre', 'Pièce', 3),
(142, 'Savon en poudre 250g', 'Paquet', 3),
(143, 'Savon en poudre 30g', 'Paquet', 3),
(144, 'Gel hydro aalcoolique 500ml', 'Bouteille', 3),
(145, 'Gel desinfectant mains', 'Bidon', 3),
(146, 'Canard liquide W.C', 'Bouteille', 3),
(147, 'Encaustique (tena raitra)', 'Bouteille', 3),
(148, 'Nettoyant tapis CASINO', 'Bouteille', 3),
(149, 'Bombe désodorisante', 'Bombe', 3);

-- --------------------------------------------------------

--
-- Structure de la table `stock`
--

CREATE TABLE `stock` (
  `stock_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 10,
  `updated_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `stock`
--

INSERT INTO `stock` (`stock_id`, `product_id`, `quantity`, `updated_at`) VALUES
(1, 1, 10, '2025-02-27 14:00:00'),
(2, 2, 10, '2025-02-27 14:00:00'),
(3, 3, 10, '2025-02-27 14:00:00'),
(4, 4, 10, '2025-02-27 14:00:00'),
(5, 5, 10, '2025-02-27 14:00:00'),
(6, 6, 10, '2025-02-27 14:00:00'),
(7, 7, 10, '2025-02-27 14:00:00'),
(8, 8, 10, '2025-02-27 14:00:00'),
(9, 9, 10, '2025-02-27 14:00:00'),
(10, 10, 10, '2025-02-27 14:00:00'),
(11, 11, 10, '2025-02-27 14:00:00'),
(12, 12, 10, '2025-02-27 14:00:00'),
(13, 13, 10, '2025-02-27 14:00:00'),
(14, 14, 10, '2025-02-27 14:00:00'),
(15, 15, 10, '2025-02-27 14:00:00'),
(16, 16, 10, '2025-02-27 14:00:00'),
(17, 17, 10, '2025-02-27 14:00:00'),
(18, 18, 10, '2025-02-27 14:00:00'),
(19, 19, 10, '2025-02-27 14:00:00'),
(20, 20, 10, '2025-02-27 14:00:00'),
(21, 21, 10, '2025-02-27 14:00:00'),
(22, 22, 10, '2025-02-27 14:00:00'),
(23, 23, 10, '2025-02-27 14:00:00'),
(24, 24, 10, '2025-02-27 14:00:00'),
(25, 25, 10, '2025-02-27 14:00:00'),
(26, 26, 10, '2025-02-27 14:00:00'),
(27, 27, 10, '2025-02-27 14:00:00'),
(28, 28, 10, '2025-02-27 14:00:00'),
(29, 29, 10, '2025-02-27 14:00:00'),
(30, 30, 10, '2025-02-27 14:00:00'),
(31, 31, 10, '2025-02-27 14:00:00'),
(32, 32, 10, '2025-02-27 14:00:00'),
(33, 33, 10, '2025-02-27 14:00:00'),
(34, 34, 10, '2025-02-27 14:00:00'),
(35, 35, 10, '2025-02-27 14:00:00'),
(36, 36, 10, '2025-02-27 14:00:00'),
(37, 37, 10, '2025-02-27 14:00:00'),
(38, 38, 10, '2025-02-27 14:00:00'),
(39, 39, 10, '2025-02-27 14:00:00'),
(40, 40, 10, '2025-02-27 14:00:00'),
(41, 41, 10, '2025-02-27 14:00:00'),
(42, 42, 10, '2025-02-27 14:00:00'),
(43, 43, 10, '2025-02-27 14:00:00'),
(44, 44, 10, '2025-02-27 14:00:00'),
(45, 45, 10, '2025-02-27 14:00:00'),
(46, 46, 10, '2025-02-27 14:00:00'),
(47, 47, 10, '2025-02-27 14:00:00'),
(48, 48, 10, '2025-02-27 14:00:00'),
(49, 49, 10, '2025-02-27 14:00:00'),
(50, 50, 10, '2025-02-27 14:00:00'),
(51, 51, 10, '2025-02-27 14:00:00'),
(52, 52, 10, '2025-02-27 14:00:00'),
(53, 53, 10, '2025-02-27 14:00:00'),
(54, 54, 10, '2025-02-27 14:00:00'),
(55, 55, 10, '2025-02-27 14:00:00'),
(56, 56, 10, '2025-02-27 14:00:00'),
(57, 57, 10, '2025-02-27 14:00:00'),
(58, 58, 10, '2025-02-27 14:00:00'),
(59, 59, 10, '2025-02-27 14:00:00'),
(60, 60, 10, '2025-02-27 14:00:00'),
(61, 61, 10, '2025-02-27 14:00:00'),
(62, 62, 10, '2025-02-27 14:00:00'),
(63, 63, 10, '2025-02-27 14:00:00'),
(64, 64, 10, '2025-02-27 14:00:00'),
(65, 65, 10, '2025-02-27 14:00:00'),
(66, 66, 10, '2025-02-27 14:00:00'),
(67, 67, 10, '2025-02-27 14:00:00'),
(68, 68, 10, '2025-02-27 14:00:00'),
(69, 69, 10, '2025-02-27 14:00:00'),
(70, 70, 10, '2025-02-27 14:00:00'),
(71, 71, 10, '2025-02-27 14:00:00'),
(72, 72, 10, '2025-02-27 14:00:00'),
(73, 73, 10, '2025-02-27 14:00:00'),
(74, 74, 10, '2025-02-27 14:00:00'),
(75, 75, 10, '2025-02-27 14:00:00'),
(76, 76, 10, '2025-02-27 14:00:00'),
(77, 77, 10, '2025-02-27 14:00:00'),
(78, 78, 10, '2025-02-27 14:00:00'),
(79, 79, 10, '2025-02-27 14:00:00'),
(80, 80, 10, '2025-02-27 14:00:00'),
(81, 81, 10, '2025-02-27 14:00:00'),
(82, 82, 10, '2025-02-27 14:00:00'),
(83, 83, 10, '2025-02-27 14:00:00'),
(84, 84, 10, '2025-02-27 14:00:00'),
(85, 85, 10, '2025-02-27 14:00:00'),
(86, 86, 10, '2025-02-27 14:00:00'),
(87, 87, 10, '2025-02-27 14:00:00'),
(88, 88, 10, '2025-02-27 14:00:00'),
(89, 89, 10, '2025-02-27 14:00:00'),
(90, 90, 10, '2025-02-27 14:00:00'),
(91, 91, 10, '2025-02-27 14:00:00'),
(92, 92, 10, '2025-02-27 14:00:00'),
(93, 93, 10, '2025-02-27 14:00:00'),
(94, 94, 10, '2025-02-27 14:00:00'),
(95, 95, 10, '2025-02-27 14:00:00'),
(96, 96, 10, '2025-02-27 14:00:00'),
(97, 97, 10, '2025-02-27 14:00:00'),
(98, 98, 10, '2025-02-27 14:00:00'),
(99, 99, 10, '2025-02-27 14:00:00'),
(100, 100, 10, '2025-02-27 14:00:00'),
(101, 101, 10, '2025-11-13 17:24:57'),
(102, 102, 10, '2025-02-27 14:00:00'),
(103, 103, 10, '2025-02-27 14:00:00'),
(104, 104, 10, '2025-02-27 14:00:00'),
(105, 105, 10, '2025-02-27 14:00:00'),
(106, 106, 10, '2025-02-27 14:00:00'),
(107, 107, 10, '2025-02-27 14:00:00'),
(108, 108, 10, '2025-02-27 14:00:00'),
(109, 109, 10, '2025-02-27 14:00:00'),
(110, 110, 10, '2025-02-27 14:00:00'),
(111, 111, 10, '2025-02-27 14:00:00'),
(112, 112, 10, '2025-02-27 14:00:00'),
(113, 113, 10, '2025-02-27 14:00:00'),
(114, 114, 10, '2025-02-27 14:00:00'),
(115, 115, 10, '2025-02-27 14:00:00'),
(116, 116, 10, '2025-02-27 14:00:00'),
(117, 117, 10, '2025-02-27 14:00:00'),
(118, 118, 10, '2025-02-27 14:00:00'),
(119, 119, 10, '2025-02-27 14:00:00'),
(120, 120, 10, '2025-02-27 14:00:00'),
(121, 121, 10, '2025-02-27 14:00:00'),
(122, 122, 10, '2025-02-27 14:00:00'),
(123, 123, 10, '2025-02-27 14:00:00'),
(124, 124, 10, '2025-02-27 14:00:00'),
(125, 125, 10, '2025-02-27 14:00:00'),
(126, 126, 10, '2025-02-27 14:00:00'),
(127, 127, 10, '2025-02-27 14:00:00'),
(128, 128, 10, '2025-02-27 14:00:00'),
(129, 129, 10, '2025-02-27 14:00:00'),
(130, 130, 10, '2025-02-27 14:00:00'),
(131, 131, 10, '2025-02-27 14:00:00'),
(132, 132, 10, '2025-02-27 14:00:00'),
(133, 133, 10, '2025-02-27 14:00:00'),
(134, 134, 10, '2025-02-27 14:00:00'),
(135, 135, 10, '2025-02-27 14:00:00'),
(136, 136, 10, '2025-02-27 14:00:00'),
(137, 137, 10, '2025-02-27 14:00:00'),
(138, 138, 10, '2025-02-27 14:00:00'),
(139, 139, 10, '2025-02-27 14:00:00'),
(140, 140, 10, '2025-02-27 14:00:00'),
(141, 141, 10, '2025-02-27 14:00:00'),
(142, 142, 10, '2025-02-27 14:00:00'),
(143, 143, 10, '2025-02-27 14:00:00'),
(144, 144, 10, '2025-02-27 14:00:00'),
(145, 145, 10, '2025-02-27 14:00:00'),
(146, 146, 10, '2025-02-27 14:00:00'),
(147, 147, 10, '2025-02-27 14:00:00'),
(148, 148, 10, '2025-02-27 14:00:00'),
(149, 149, 10, '2025-02-27 14:00:00');

-- --------------------------------------------------------

--
-- Structure de la table `stock_entries`
--

CREATE TABLE `stock_entries` (
  `entry_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity_added` int(11) NOT NULL,
  `proposed_by` varchar(50) NOT NULL,
  `proposed_date` datetime DEFAULT current_timestamp(),
  `validated_by` varchar(50) DEFAULT NULL,
  `validated_date` datetime DEFAULT NULL,
  `status` enum('pending','validated','rejected') NOT NULL DEFAULT 'pending',
  `motif_rejet` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `stock_entries`
--

INSERT INTO `stock_entries` (`entry_id`, `product_id`, `quantity_added`, `proposed_by`, `proposed_date`, `validated_by`, `validated_date`, `status`, `motif_rejet`) VALUES
(1, 101, 10, 'comptable1', '2025-11-13 17:24:22', 'chef1', '2025-11-13 17:24:57', 'validated', NULL),
(2, 102, 10, 'comptable1', '2025-11-14 09:24:03', NULL, NULL, 'pending', NULL);

--
-- Déclencheurs `stock_entries`
--
DELIMITER $$
CREATE TRIGGER `after_stock_entry_validated` AFTER UPDATE ON `stock_entries` FOR EACH ROW BEGIN
    IF NEW.status = 'validated' AND OLD.status != 'validated' THEN
        UPDATE stock 
        SET quantity = quantity + NEW.quantity_added, updated_at = NOW() 
        WHERE product_id = NEW.product_id;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `login` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('comptable','chef_principal','chef_service','admin') NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`user_id`, `login`, `password`, `role`, `created_at`) VALUES
(1, 'comptable1', '$2b$10$X5LRgcCakGoJQ4GNRCNw8.GIydbJlWXFa8U8wlnQpNMbhZTCa4WGi', 'comptable', '2025-02-27 14:00:00'),
(2, 'chef1', '$2b$10$8tVKYqatW./AVRLR6rwQieikH8h9Pf4LHGwLnlNBsalPEjK/ot.s.', 'chef_principal', '2025-02-27 14:00:00'),
(3, 'utl1', '$2b$10$VpSk2tbJENXmG7YCVFxFZeQvXaoj2tFZbqhazbRBCmnwP3UJ6WdKO', 'chef_service', '2025-02-27 14:00:00'),
(4, 'utl2', '$2b$10$gBKP6mvjVSQMgC1B/Bbi..p7GnMfqCKZp8cNjh.mFX1T46spxeAKe', 'chef_service', '2025-02-27 14:00:00'),
(5, 'admin', '$2b$10$U27oUXjLl1Amlj9NuQgdqOfYw85jxSy94tFKd.dfiiwVJIa6fmM/e', 'admin', '2025-02-27 14:00:00');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`account_id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Index pour la table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD PRIMARY KEY (`log_id`);

--
-- Index pour la table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_user_login` (`identifiant_utilisateur`),
  ADD KEY `idx_motif_rejet` (`motif_rejet`(50));

--
-- Index pour la table `order_actions`
--
ALTER TABLE `order_actions`
  ADD PRIMARY KEY (`action_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_auteur_login` (`auteur_login`);

--
-- Index pour la table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `account_id` (`account_id`);

--
-- Index pour la table `stock`
--
ALTER TABLE `stock`
  ADD PRIMARY KEY (`stock_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Index pour la table `stock_entries`
--
ALTER TABLE `stock_entries`
  ADD PRIMARY KEY (`entry_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `login` (`login`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `accounts`
--
ALTER TABLE `accounts`
  MODIFY `account_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `admin_logs`
--
ALTER TABLE `admin_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `order_actions`
--
ALTER TABLE `order_actions`
  MODIFY `action_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=150;

--
-- AUTO_INCREMENT pour la table `stock`
--
ALTER TABLE `stock`
  MODIFY `stock_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=150;

--
-- AUTO_INCREMENT pour la table `stock_entries`
--
ALTER TABLE `stock_entries`
  MODIFY `entry_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `order_actions`
--
ALTER TABLE `order_actions`
  ADD CONSTRAINT `order_actions_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  ADD CONSTRAINT `order_actions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Contraintes pour la table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`account_id`);

--
-- Contraintes pour la table `stock`
--
ALTER TABLE `stock`
  ADD CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `stock_entries`
--
ALTER TABLE `stock_entries`
  ADD CONSTRAINT `stock_entries_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
