<?php

final class Kintone_API
{
	/*
	 * constructor
	 */
	private function __construct()
	{

	}

	/*
	 * get instance
	 */
	public static function getInstance()
	{
		/**
		* a variable that keeps the sole instance.
		*/
		static $instance;

		if ( !isset( $instance ) ) {
			$instance = new Kintone_API();
		}
		return $instance;
	}

	/*
	 * don't allow you to clone the instance.
	 */
	public final function __clone() {
		throw new RuntimeException( 'Clone is not allowed against ' );
	}


	/*
	 * Get Kintone auth header from Options API
	 * https://cybozudev.zendesk.com/hc/ja/articles/201941754-REST-API%E3%81%AE%E5%85%B1%E9%80%9A%E4%BB%95%E6%A7%98#step7
	 * @param  none
	 * @return array An array of auth header
	 * @since  0.1
	 */
	public static function get_auth_header( $token )
	{
		if ( $token ) {
			return array( 'X-Cybozu-API-Token' => $token );
		} else {
			return new WP_Error( 'kintone', 'API Token is required' );
		}
	}


	/*
	 * Get Kintone basic auth header from Options API
	 * https://cybozudev.zendesk.com/hc/ja/articles/201941754-REST-API%E3%81%AE%E5%85%B1%E9%80%9A%E4%BB%95%E6%A7%98#step8
	 * @param  none
	 * @return array An array of basic auth header
	 * @since  0.1
	 */
	public static function get_basic_auth_header( $basic_auth_user = null, $basic_auth_pass = null )
	{
		if ( $basic_auth_user && $basic_auth_pass ) {
			$auth = base64_encode( $basic_auth_user.':'.$basic_auth_pass );
			return array( 'Authorization' => 'Basic '.$auth );
		} elseif ( Kintone_Options::get_basic_auth_user() && Kintone_Options::get_basic_auth_pass() ) {
			$auth = base64_encode( Kintone_Options::get_basic_auth_user().':'.Kintone_Options::get_basic_auth_pass() );
			return array( 'Authorization' => 'Basic '.$auth );
		} else {
			return array();
		}
	}


	/*
	 * Get Kintone request headers from Options API
	 * @param  none
	 * @return array An array of request headers
	 * @since  0.1
	 */
	public static function get_request_headers( $token, $basic_auth_user = null, $basic_auth_pass = null )
	{
		if ( is_wp_error( self::get_auth_header( $token ) ) ) {
			return new WP_Error( 'kintone', 'API Token is required' );
		}

		$headers = array_merge(
			self::get_auth_header( $token ), self::get_basic_auth_header( $basic_auth_user, $basic_auth_pass )
		);

		return $headers;
	}


	/*
	 * Get form controls from single JSON
	 * @param  string $json An JSON of hash array
	 * @return string	   Form control html
	 * @since  0.1
	 */
	public static function get_control( $control )
	{
		$method = strtolower( $control['type'] );
		if ( isset( $control['code'] ) && $control['code'] ) {
			$control['code'] = '_kintone_control_'.$control['code'];
		}
		return call_user_func( array( 'Form_Controls', $method ), $control );
	}


	/*
	 * Get form controls from REST API
	 * @param  string $json Responce JSON from REST API
	 * @return array		Form html
	 * @since  0.1
	 */
	public static function parse_form( $controls )
	{
		$html = '';
		foreach ( $controls as $control ) {
			$html .= self::get_control( $control )."\n";
		}

		return $html;
	}


	/*
	 * Get form controls json from REST API
	 * @param  string $token  API token
	 * @param  string $app_id Kintone App ID
	 * @return array		Form html
	 * @since  0.1
	 */
	public static function get_form_json( $token, $app_id, $sub_domain = null, $basic_auth_user = null, $basic_auth_pass = null )
	{
		if ( !intval( $app_id ) ) {
			return new WP_Error( 'kintone', 'Application ID must be numeric.' );
		}

		if ( !$sub_domain ) {
			$sub_domain = Kintone_Options::get_sub_domain();
		}
		
		
		/* Change kintone API url by country */
		$uri = $_SERVER['REQUEST_URI'];
		
		if (stripos($uri,'jp')){
			$url = sprintf(
				'https://%s.cybozu.com/k/v1/form.json?app=%d',
				$sub_domain,
				$app_id
			);
		}
		else {
			$url = sprintf(
				'https://%s.kintone.com/k/v1/form.json?app=%d',
				$sub_domain,
				$app_id
			);
		}
		/* End*/
		
		$headers = Kintone_API::get_request_headers( $token, $basic_auth_user, $basic_auth_pass );
		if ( is_wp_error( $headers ) ) {
			return $headers;
		}

		$res = wp_remote_get(
			$url,
			array(
				'headers' => $headers
			)
		);

		if ( is_wp_error( $res ) ) {
			return $res;
		} else {
			$return_value = json_decode( $res['body'], true );
			if ( isset( $return_value['message'] ) && isset( $return_value['code'] ) ) {
				return new WP_Error( $return_value['code'], $return_value['message'] );
			} else {
				return $return_value['properties'];
			}
		}
	}


	/*
	 * Sort controls
	 * @param  string $control  controls
	 * @param  string $orderby  'code' or 'label' or null
	 * @param  string $order	SORT_ASC or SORT_DESC or null
	 * @return array			$controls
	 * @since  0.1
	 */
	 public static function sort_controls( $controls, $order = 'asc', $orderby = null )
	 {
		 if ( ( !$orderby && !$order ) || ( !$orderby && $order === 'asc' ) ) {
			 return $controls;
		 } elseif ( !$orderby && $order === 'desc' ) {
			 return array_reverse( $controls );
		 } elseif ( $orderby ) {
			 $sort = array();
			 foreach ( $controls as $key => $control ) {
				 $sort[$key] = $control[$orderby];
			 }
			 if ( $order === 'desc' ) {
				 array_multisort( $sort, SORT_DESC, SORT_REGULAR, $controls );
			 } else {
				 array_multisort( $sort, SORT_ASC, SORT_REGULAR, $controls );
			 }
			 return $controls;
		 } else {
			 return $controls;
		 }
	 }


	/*
	 * Exclude controls
	 * @param  string $control  controls
	 * @param  string $exclude  code name for exclude
	 * @return array			$controls
	 * @since  0.1
	 */
	 public static function exclude_controls( $controls, $exclude = null )
	 {
		 $excludes = array_filter( preg_split( '/,/', $exclude ), 'trim' );
		 $c = array();
		 foreach ( $controls as $control ) {
			 if ( isset( $control['code'] ) && preg_match( '/^__/', $control['code'] ) ) {
				 continue;
			 }
			 if ( isset( $control['code'] ) && in_array( $control['code'], $excludes ) ) {
				 continue;
			 }
			 
			$c[] = $control;
		 }

		return $c;
	}


	/*
	 * Send form data to Kintone API
	 * @param  string $kintone  Shortcode attributes it need for auth.
	 * @param  string $data	 $_POST data
	 * @return array			true or WP_Error object
	 * @since  0.1
	 */
	private static function save_data( $kintone, $data )
	{
		/* Change kintone API url by country */
		$uri = $_SERVER['REQUEST_URI'];
		
		if (stripos($uri,'jp')){
			$url = sprintf(
				'https://%s.cybozu.com/k/v1/record.json',
				$kintone['sub_domain']
			);
		}
		else{
			$url = sprintf(
				'https://%s.kintone.com/k/v1/record.json',
				$kintone['sub_domain']
			);
		}
		/* End */
		
		if ( isset( $kintone['basic_auth_user'] ) && isset( $kintone['basic_auth_pass'] ) ) {
			$headers = Kintone_API::get_request_headers( $kintone['token'], $kintone['basic_auth_user'], $kintone['basic_auth_pass'] );
		} else {
			$headers = Kintone_API::get_request_headers( $kintone['token'] );
		}
		if ( is_wp_error( $headers ) ) {
			return $headers;
		}

		$headers['Content-Type'] = 'application/json';

		$record = self::parse_record( $data );

		$body = array(
			'app'	=> $kintone['app'],
			'record' => $record,
		);

		$res = wp_remote_post(
			$url,
			array(
				'method'  => 'POST',
				'headers' => $headers,
				'body'	=> json_encode( $body ),
			)
		);

		if ( is_wp_error( $res ) ) {
			return $res;
		} elseif (  $res['response']['code'] !== 200 ) {
			$message = json_decode( $res['body'], true );
			$e = new WP_Error();
			$e->add( 'validation-error', $message['message'], $message );
			return $e;
		} else {
			return true;
		}
	}


	/*
	 * Prase $_POST to Kintone's record format.
	 * @param  string $data $_POST data
	 * @return array        Kintone's formated array.
	 * @since  0.1
	 */
	public static function parse_record( $data )
	{
		$record = array();
		foreach ( $data as $key => $value ) {
			$key = preg_replace("/^_kintone_control_/", "", $key);
			$record[$key] = array( 'value' => $value );
		}

		return $record;
	}


	public static function send( $data )
	{
		$kintone = get_option( $data['_kintone_key'], false );
		if ( ! $kintone ) {
			return new WP_Error( __LINE__ );
		}

		$result = self::save_data( $kintone, $data );

		if ( is_wp_error( $result ) ) {
			return $result;
		} else {
			update_option( 'kintone-success', true );
			return true;
		}
	}


	/*
	 * Save shortcode atts and token as option
	 * @param  string $data shortcode atts
	 * @return array        options key
	 * @since  0.1
	 */
	public static function save_option_key( $atts ) {
		$option_key = 'kintone-'. sha1( $atts['sub_domain'] . $atts['app'] );			update_option( $option_key, $atts );

		return $option_key;
	}
}


// EOF
