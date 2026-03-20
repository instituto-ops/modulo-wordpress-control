<?php
/**
 * Plugin Name: AntiGravity CORS & Security (Headless)
 * Description: Bloqueia ataques, permite CORS com o painel JS e otimiza a REST API do WordPress para a Metodologia Abidos.
 * Version: 1.1.0
 * Author: NeuroStrategy OS
 */

if (!defined('ABSPATH')) {
    exit; // Segurança: Não carrega o arquivo diretamente.
}

/**
 * 1. CONFIGURAÇÃO DE CORS E SEGURANÇA
 * Permite que apenas o seu Mission Control faça requisições de escrita/leitura.
 */
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        
        $allowed_origins = array(
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5500',
            'http://127.0.0.1:5500'
        );

        $origin = get_http_origin();

        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . esc_url_raw($origin));
        }

        header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Expose-Headers: X-WP-Total, X-WP-TotalPages, Authorization');
        header('Access-Control-Allow-Headers: Authorization, X-WP-Nonce, Content-Type, X-Requested-With, Application-Password');
        
        // Headers Adicionais de Segurança (Anti-XSS, Anti-Sniffing)
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('Referrer-Policy: strict-origin-when-cross-origin');

        return $value;
    });
}, 15);

/**
 * 2. EXPOSIÇÃO DO CAMPO META (SEO) nas respostas REST.
 */
add_action('rest_api_init', 'antigravity_expose_seo_meta');
function antigravity_expose_seo_meta() {
    $post_types = ['post', 'page'];
    
    foreach ($post_types as $pt) {
        // Expondo o campo EXCERPT (Resumo)
        register_rest_field($pt, 'excerpt', array(
            'get_callback' => function($object) {
                return $object['excerpt']['rendered'] ?? '';
            },
            'update_callback' => function($value, $post) {
                return wp_update_post(array('ID' => $post->ID, 'post_excerpt' => $value));
            },
            'schema' => null,
        ));
        
        // Expondo Meta Descriptions para Yoast e RankMath
        register_rest_field($pt, 'seo_meta_desc', array(
            'get_callback' => function($object) {
                $yoast = get_post_meta($object['id'], '_yoast_wpseo_metadesc', true);
                return $yoast ? $yoast : get_post_meta($object['id'], 'rank_math_description', true);
            },
            'update_callback' => function($value, $post) {
                update_post_meta($post->ID, '_yoast_wpseo_metadesc', $value);
                update_post_meta($post->ID, 'rank_math_description', $value);
                return true;
            },
            'schema' => null,
        ));
    }
}

/**
 * 3. SEGURANÇA: ESCONDER USUÁRIOS E PREVENIR ENUMERAÇÃO
 */
add_filter('rest_endpoints', function($endpoints) {
    if (isset($endpoints['/wp/v2/users'])) unset($endpoints['/wp/v2/users']);
    if (isset($endpoints['/wp/v2/users/(?P<id>[\d]+)'])) unset($endpoints['/wp/v2/users/(?P<id>[\d]+)']);
    return $endpoints;
});

/**
 * 4. ELEMENTOR LIBRARY NA REST API
 * Via filter (método recomendado)
 */
add_filter('register_post_type_args', function($args, $post_type) {
    if ($post_type === 'elementor_library') {
        $args['show_in_rest'] = true;
        $args['rest_base'] = 'elementor_library';
    }
    return $args;
}, 10, 2);

/**
 * 5. ROTAS CUSTOMIZADAS DE CONFIGURAÇÃO (Headless Dashboard)
 */
add_action('rest_api_init', function() {
    register_rest_route('antigravity/v1', '/settings', array(
        'methods' => 'GET',
        'callback' => 'antigravity_get_settings',
        'permission_callback' => function () { return current_user_can('manage_options'); }
    ));

    register_rest_route('antigravity/v1', '/settings', array(
        'methods' => 'POST',
        'callback' => 'antigravity_update_settings',
        'permission_callback' => function () { return current_user_can('manage_options'); }
    ));
});

function antigravity_get_settings() {
    return rest_ensure_response(array(
        'site_title'     => get_option('blogname'),
        'site_description' => get_option('blogdescription'),
        'astra_settings'  => get_option('astra-settings', array()),
        'antigravity_whatsapp' => get_option('antigravity_whatsapp', '5562991545295'),
        'elementor_disable_color_schemes' => get_option('elementor_disable_color_schemes', ''),
        'elementor_disable_typography_schemes' => get_option('elementor_disable_typography_schemes', '')
    ));
}

function antigravity_update_settings($request) {
    $params = $request->get_json_params();
    
    $text_fields = [
        'site_title' => 'blogname',
        'site_description' => 'blogdescription',
        'antigravity_whatsapp' => 'antigravity_whatsapp',
    ];

    foreach ($text_fields as $param_key => $option_name) {
        if (isset($params[$param_key])) {
            update_option($option_name, sanitize_text_field($params[$param_key]));
        }
    }
    
    // Atualiza Astra Settings (preservando estrutura de array)
    if (isset($params['astra_settings']) && is_array($params['astra_settings'])) {
        update_option('astra-settings', $params['astra_settings']);
    }

    return rest_ensure_response(array('status' => 'success', 'message' => 'Configurações sincronizadas com AntiGravity.'));
}


