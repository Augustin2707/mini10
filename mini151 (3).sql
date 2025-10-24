-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 21 oct. 2025 à 14:52
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
-- Base de données : `mini151`
--

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
(1, 3, 1, 20, 'lany', '', 'received', NULL, '2025-10-15 10:37:16', '2025-10-15 10:40:19', NULL, 'utl1'),
(2, 3, 2, 10, 'lany\r\n', '', 'received', NULL, '2025-10-15 10:37:42', '2025-10-15 11:47:13', NULL, 'utl1'),
(3, 3, 1, 10, 'ruptur', '', 'received', NULL, '2025-10-15 11:45:31', '2025-10-15 17:13:02', NULL, 'utl1'),
(4, 3, 1, 12, 'ruptur', 'rapide', 'rejected', NULL, '2025-10-15 15:46:48', NULL, NULL, 'utl1'),
(5, 3, 1, 10, 'rupture', '', 'received', NULL, '2025-10-16 10:24:25', '2025-10-16 10:26:54', NULL, 'utl1'),
(6, 3, 2, 9, 'lany', '', 'pending', NULL, '2025-10-16 10:26:36', NULL, NULL, 'utl1'),
(7, 3, 1, 4, 'lany', '', 'received', NULL, '2025-10-16 10:27:23', '2025-10-21 09:36:07', NULL, 'utl1'),
(8, 3, 2, 4, 'lany', '', 'rejected', NULL, '2025-10-20 09:37:27', NULL, NULL, 'utl1'),
(9, 3, 1, 2, 'lany', '', 'rejected', NULL, '2025-10-20 09:37:45', NULL, NULL, 'utl1'),
(10, 4, 1, 10, 'lany', '', 'received', NULL, '2025-10-20 17:08:40', '2025-10-20 17:12:56', NULL, 'utl2'),
(11, 4, 2, 14, 'ruptur', '', 'received', NULL, '2025-10-20 17:09:00', '2025-10-20 17:12:52', NULL, 'utl2'),
(12, 3, 2, 47, 'rupture', '', 'in_delivery', NULL, '2025-10-20 17:14:36', NULL, '2025-10-21 11:05:11', 'utl1'),
(13, 3, 2, 14, 'Lany', '', 'received', NULL, '2025-10-21 08:44:30', '2025-10-21 09:36:14', NULL, 'utl1'),
(14, 3, 2, 2, 'ruptur', '', 'validated', NULL, '2025-10-21 09:32:06', NULL, NULL, 'utl1'),
(15, 4, 1, 14, 'lany', '', 'pending', NULL, '2025-10-21 11:03:11', NULL, NULL, 'utl2'),
(16, 4, 2, 10, 'rupture', '', 'received', NULL, '2025-10-21 11:03:32', '2025-10-21 11:06:30', '2025-10-21 11:05:32', 'utl2');

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
(1, 2, 2, 'validate', '2025-10-15 10:38:23', 'chef1'),
(2, 1, 2, 'validate', '2025-10-15 10:38:25', 'chef1'),
(3, 1, 1, 'deliver', '2025-10-15 10:39:35', 'comptable1'),
(4, 1, 3, 'receive', '2025-10-15 10:40:19', 'utl1'),
(5, 3, 2, 'validate', '2025-10-15 11:45:55', 'chef1'),
(6, 2, 1, 'deliver', '2025-10-15 11:46:57', 'comptable1'),
(7, 2, 3, 'receive', '2025-10-15 11:47:13', 'utl1'),
(8, 4, 2, 'reject', '2025-10-15 15:51:04', 'chef1'),
(9, 3, 1, 'deliver', '2025-10-15 17:12:09', 'comptable1'),
(10, 3, 3, 'receive', '2025-10-15 17:13:02', 'utl1'),
(11, 5, 2, 'validate', '2025-10-16 10:25:10', 'chef1'),
(12, 5, 1, 'deliver', '2025-10-16 10:26:09', 'comptable1'),
(13, 5, 3, 'receive', '2025-10-16 10:26:54', 'utl1'),
(14, 7, 2, 'validate', '2025-10-19 19:26:54', 'chef1'),
(15, 8, 2, 'reject', '2025-10-20 09:50:56', 'chef1'),
(16, 10, 2, 'validate', '2025-10-20 17:10:03', 'chef1'),
(17, 11, 2, 'validate', '2025-10-20 17:10:09', 'chef1'),
(18, 11, 1, 'deliver', '2025-10-20 17:12:14', 'comptable1'),
(19, 11, 1, 'deliver', '2025-10-20 17:12:24', 'comptable1'),
(20, 10, 1, 'deliver', '2025-10-20 17:12:31', 'comptable1'),
(21, 11, 4, 'receive', '2025-10-20 17:12:52', 'utl2'),
(22, 10, 4, 'receive', '2025-10-20 17:12:56', 'utl2'),
(23, 13, 2, 'validate', '2025-10-21 08:48:05', 'chef1'),
(24, 7, 1, 'deliver', '2025-10-21 08:50:14', 'comptable1'),
(25, 7, 1, 'deliver', '2025-10-21 09:13:23', 'comptable1'),
(26, 7, 1, 'deliver', '2025-10-21 09:13:26', 'comptable1'),
(27, 9, 2, 'reject', '2025-10-21 09:33:34', 'chef1'),
(28, 14, 2, 'validate', '2025-10-21 09:34:21', 'chef1'),
(29, 7, 1, 'deliver', '2025-10-21 09:35:06', 'comptable1'),
(30, 13, 1, 'deliver', '2025-10-21 09:35:12', 'comptable1'),
(31, 7, 3, 'receive', '2025-10-21 09:36:07', 'utl1'),
(32, 13, 3, 'receive', '2025-10-21 09:36:14', 'utl1'),
(33, 16, 2, 'validate', '2025-10-21 11:04:02', 'chef1'),
(34, 12, 2, 'validate', '2025-10-21 11:04:08', 'chef1'),
(35, 12, 1, 'deliver', '2025-10-21 11:05:11', 'comptable1'),
(36, 16, 1, 'deliver', '2025-10-21 11:05:32', 'comptable1'),
(37, 16, 4, 'receive', '2025-10-21 11:06:30', 'utl2');

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
    IF NEW.action_type = 'receive' THEN  -- Changé : seulement sur 'receive' (confirmation utilisateur)
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
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `products`
--

INSERT INTO `products` (`product_id`, `name`, `description`) VALUES
(1, 'Papier A4', 'Paquet de 500 feuilles'),
(2, 'Stylo bleu', 'Stylo à bille bleu');

-- --------------------------------------------------------

--
-- Structure de la table `stock`
--

CREATE TABLE `stock` (
  `stock_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `updated_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `stock`
--

INSERT INTO `stock` (`stock_id`, `product_id`, `quantity`, `updated_at`) VALUES
(1, 1, 223, '2025-10-19 19:27:10'),
(2, 2, 223, '2025-10-20 09:58:50');

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
(1, 1, 250, 'comptable1', '2025-10-15 10:35:12', 'chef1', '2025-10-15 10:35:56', 'validated', NULL),
(2, 2, 250, 'comptable1', '2025-10-15 10:35:20', 'chef1', '2025-10-15 10:36:08', 'validated', NULL),
(3, 1, 10, 'comptable1', '2025-10-15 11:39:09', 'chef1', '2025-10-15 11:40:01', 'validated', NULL),
(4, 2, 10, 'comptable1', '2025-10-15 11:39:17', 'chef1', '2025-10-15 11:44:23', 'validated', NULL),
(5, 1, 12, 'comptable1', '2025-10-15 15:48:22', 'chef1', '2025-10-15 15:48:53', 'validated', NULL),
(6, 2, 14, 'comptable1', '2025-10-15 15:48:32', 'chef1', '2025-10-15 15:50:50', 'rejected', NULL),
(7, 1, 1, 'comptable1', '2025-10-15 16:05:30', 'chef1', '2025-10-15 16:06:24', 'validated', NULL),
(8, 2, 2, 'comptable1', '2025-10-15 16:05:35', 'chef1', '2025-10-15 16:06:59', 'rejected', NULL),
(9, 1, 3, 'comptable1', '2025-10-15 16:05:40', 'chef1', '2025-10-15 16:06:27', 'validated', NULL),
(10, 2, 2, 'comptable1', '2025-10-15 16:05:44', NULL, NULL, 'pending', NULL),
(11, 1, 14, 'comptable1', '2025-10-16 10:11:49', NULL, NULL, 'pending', NULL),
(12, 2, 10, 'comptable1', '2025-10-16 10:12:19', 'chef1', '2025-10-20 09:58:50', 'validated', NULL),
(13, 1, 15, 'comptable1', '2025-10-16 10:18:39', 'chef1', '2025-10-19 19:27:05', 'rejected', NULL),
(14, 2, 1, 'comptable1', '2025-10-19 18:47:09', 'chef1', '2025-10-19 19:26:49', 'validated', NULL),
(15, 1, 1, 'comptable1', '2025-10-19 19:12:21', 'chef1', '2025-10-19 19:27:10', 'validated', NULL);

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
  `role` enum('comptable','chef_principal','chef_service') NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`user_id`, `login`, `password`, `role`, `created_at`) VALUES
(1, 'comptable1', '$2b$10$X5LRgcCakGoJQ4GNRCNw8.GIydbJlWXFa8U8wlnQpNMbhZTCa4WGi', 'comptable', '2025-10-10 08:58:44'),
(2, 'chef1', '$2b$10$8tVKYqatW./AVRLR6rwQieikH8h9Pf4LHGwLnlNBsalPEjK/ot.s.', 'chef_principal', '2025-10-10 08:58:44'),
(3, 'utl1', '$2b$10$VpSk2tbJENXmG7YCVFxFZeQvXaoj2tFZbqhazbRBCmnwP3UJ6WdKO', 'chef_service', '2025-10-10 08:58:44'),
(4, 'utl2', '$2b$10$gBKP6mvjVSQMgC1B/Bbi..p7GnMfqCKZp8cNjh.mFX1T46spxeAKe', 'chef_service', '2025-10-20 17:07:29');

--
-- Index pour les tables déchargées
--

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
  ADD PRIMARY KEY (`product_id`);

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
-- AUTO_INCREMENT pour la table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT pour la table `order_actions`
--
ALTER TABLE `order_actions`
  MODIFY `action_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT pour la table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `stock`
--
ALTER TABLE `stock`
  MODIFY `stock_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `stock_entries`
--
ALTER TABLE `stock_entries`
  MODIFY `entry_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Contraintes pour la table `order_actions`
--
ALTER TABLE `order_actions`
  ADD CONSTRAINT `order_actions_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  ADD CONSTRAINT `order_actions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Contraintes pour la table `stock`
--
ALTER TABLE `stock`
  ADD CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Contraintes pour la table `stock_entries`
--
ALTER TABLE `stock_entries`
  ADD CONSTRAINT `stock_entries_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
